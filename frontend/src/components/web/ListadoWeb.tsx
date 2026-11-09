'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ICONOS_CATEGORIA, ICONO_GENERICO } from '../home/categoriaIconos';
import { Estrellas } from '../negocio/Estrellas';
import { IconExternal, IconHeart, IconHeartFill, IconPin, IconSearch } from '../ui/icons';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import { cx } from '@/lib/cx';
import { abiertoAhora } from '@/lib/horario';
import { useFavoritos } from '@/lib/useFavoritos';
import type { Negocio } from '@/types';

const POR_PAGINA = 6;
const SIN_LIMITE = 11;

// Listado de la versión web: por categoría (slug) o por búsqueda libre (consulta)
export function ListadoWeb({ slug, consulta = '' }: { slug?: string; consulta?: string }) {
  const { categorias } = useCategorias();
  const categoria = categorias.find((c) => c.slug === slug);
  const favs = useFavoritos();

  const [buscar, setBuscar] = useState(consulta);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [pedirUbicacion, setPedirUbicacion] = useState(false);
  const [datos, setDatos] = useState<Negocio[]>([]);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState('');

  const [subs, setSubs] = useState<string[]>([]);
  const [maxKm, setMaxKm] = useState(SIN_LIMITE);
  const [califMin, setCalifMin] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [domicilio, setDomicilio] = useState(false);
  const [orden, setOrden] = useState<'recomendados' | 'distancia' | 'nombre'>('recomendados');
  const [pagina, setPagina] = useState(1);

  useEffect(() => { setBuscar(consulta); }, [consulta]);
  // Se usa la ubicación si el navegador ya la dio o cuando la persona la pide
  useEffect(() => {
    if (!pedirUbicacion) return;
    navigator.geolocation?.getCurrentPosition((p) => setUbicacion({ lat: p.coords.latitude, lng: p.coords.longitude }), () => setPedirUbicacion(false), { timeout: 8000 });
  }, [pedirUbicacion]);
  useEffect(() => {
    navigator.permissions?.query({ name: 'geolocation' }).then((r) => { if (r.state === 'granted') setPedirUbicacion(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (slug) params.set('categoria', slug);
    if (buscar.trim()) params.set('buscar', buscar.trim());
    if (ubicacion) { params.set('lat', String(ubicacion.lat)); params.set('lng', String(ubicacion.lng)); }
    const espera = setTimeout(() => {
      api<Negocio[]>(`/negocios?${params}`).then((d) => { setDatos(d); setError(''); }).catch((e: Error) => setError(e.message)).finally(() => setListo(true));
    }, 250);
    return () => clearTimeout(espera);
  }, [slug, buscar, ubicacion]);

  useEffect(() => { setPagina(1); }, [subs, maxKm, califMin, abierto, domicilio, orden, buscar, slug]);

  const subcategorias = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const n of datos) if (n.subcategoria) cuenta.set(n.subcategoria, (cuenta.get(n.subcategoria) ?? 0) + 1);
    for (const s of categoria?.subcategorias ?? []) if (!cuenta.has(s)) cuenta.set(s, 0);
    return Array.from(cuenta.entries());
  }, [datos, categoria]);

  const filtrados = useMemo(() => {
    let l = datos.filter((n) =>
      (subs.length === 0 || (n.subcategoria != null && subs.includes(n.subcategoria))) &&
      n.calificacion >= califMin &&
      (!abierto || abiertoAhora(n.horariosJson) === true) &&
      (!domicilio || !!n.atiendeDomicilio) &&
      (maxKm === SIN_LIMITE || n.distanciaKm == null || n.distanciaKm <= maxKm));
    if (orden === 'distancia' && ubicacion) l = [...l].sort((a, b) => (a.distanciaKm ?? 1e9) - (b.distanciaKm ?? 1e9));
    else if (orden === 'nombre') l = [...l].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    else l = [...l].sort((a, b) => b.calificacion - a.calificacion);
    return l;
  }, [datos, subs, califMin, abierto, domicilio, maxKm, orden, ubicacion]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const hayFiltros = subs.length > 0 || califMin > 0 || abierto || domicilio || maxKm !== SIN_LIMITE;
  const restablecer = () => { setSubs([]); setCalifMin(0); setAbierto(false); setDomicilio(false); setMaxKm(SIN_LIMITE); };
  const titulo = categoria?.nombre ?? (consulta ? `Resultados para “${consulta}”` : 'Todos los servicios');

  return (
    <div className="wa-ancho">
      <nav className="wa-migas" aria-label="Ruta"><Link href="/home">Inicio</Link><span>›</span>{categoria ? <><span>Categorías</span><span>›</span><strong>{categoria.nombre}</strong></> : <strong>Búsqueda</strong>}</nav>

      <header className="wa-titulo">
        <span className="wa-titulo__icono">{(slug && ICONOS_CATEGORIA[slug]) || ICONO_GENERICO}</span>
        <div>
          <h1>{titulo}</h1>
          <p>{categoria ? `Negocios de ${categoria.nombre.toLowerCase()} cerca de ti, con horarios y reservas en línea.` : 'Encuentra negocios locales y reserva en línea.'}</p>
        </div>
      </header>

      <form className="wa-buscador" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="wa-buscador__campo">
          <IconSearch />
          <span><small>¿Qué necesitas hoy?</small><input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder={categoria ? `Buscar en ${categoria.nombre}` : 'Buscar servicios'} /></span>
        </label>
        <button type="button" className="wa-buscador__campo wa-buscador__ubic" onClick={() => setPedirUbicacion(true)}>
          <IconPin />
          <span><small>Ubicación</small><strong>{ubicacion ? 'Tu ubicación actual' : 'Usar mi ubicación'}</strong></span>
        </button>
        <button type="submit" className="wa-btn-primario">Buscar servicios</button>
      </form>

      <div className="wa-cuerpo">
        <aside className="wa-filtros" aria-label="Filtros">
          <div className="wa-filtros__cab"><strong>Filtros</strong></div>

          {subcategorias.length > 0 && (
            <fieldset>
              <legend>Tipo de servicio</legend>
              <label className="wa-check"><input type="checkbox" checked={subs.length === 0} onChange={() => setSubs([])} /> Todos <small>{datos.length}</small></label>
              {subcategorias.map(([s, n]) => (
                <label key={s} className="wa-check"><input type="checkbox" checked={subs.includes(s)} onChange={() => setSubs((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s]))} /> {s} <small>{n}</small></label>
              ))}
            </fieldset>
          )}

          <fieldset>
            <legend>Distancia máxima</legend>
            <div className="wa-rango__valor"><span>Cerca de ti</span><strong>{maxKm === SIN_LIMITE ? 'Sin límite' : `${maxKm} km`}</strong></div>
            <input type="range" min={1} max={SIN_LIMITE} value={maxKm} disabled={!ubicacion} aria-label="Distancia máxima" onChange={(e) => setMaxKm(Number(e.target.value))} />
            <div className="wa-rango__ejes"><small>1 km</small><small>10+ km</small></div>
            {!ubicacion && <small className="wa-nota">Activa tu ubicación para filtrar por distancia.</small>}
          </fieldset>

          <fieldset>
            <legend>Valoración</legend>
            {([[0, 'Todas'], [4.5, '4.5 estrellas o más'], [4, '4 estrellas o más']] as const).map(([v, t]) => (
              <label key={v} className="wa-check"><input type="checkbox" checked={califMin === v} onChange={() => setCalifMin(v)} /> {t}</label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Disponibilidad</legend>
            <label className="wa-check"><input type="checkbox" checked={abierto} onChange={(e) => setAbierto(e.target.checked)} /> Abierto ahora</label>
            <label className="wa-check"><input type="checkbox" checked={domicilio} onChange={(e) => setDomicilio(e.target.checked)} /> Atención a domicilio</label>
          </fieldset>

          <button type="button" className="wa-enlace" disabled={!hayFiltros} onClick={restablecer}>Restablecer filtros</button>
        </aside>

        <section className="wa-resultados" aria-live="polite">
          <div className="wa-resultados__cab">
            <h2>{ubicacion ? 'Cerca de ti' : 'Resultados'} <span className="wa-pastilla">{filtrados.length} establecimiento{filtrados.length === 1 ? '' : 's'}</span></h2>
            <label className="wa-orden">Ordenar por
              <select value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)}>
                <option value="recomendados">Recomendados</option>
                <option value="distancia" disabled={!ubicacion}>Distancia</option>
                <option value="nombre">Nombre (A–Z)</option>
              </select>
            </label>
          </div>

          {error && <p className="form__error">{error}</p>}
          {listo && !error && filtrados.length === 0 && <p className="wa-vacio">No encontramos negocios con esos filtros.{hayFiltros && <> <button type="button" className="wa-enlace" onClick={restablecer}>Restablecer filtros</button></>}</p>}

          <div className="wa-grid">
            {visibles.map((n) => {
              const esFav = favs.esFavorito(n.id);
              return (
                <article key={n.id} className="wa-card">
                  <Link href={`/negocio/${n.id}`} className="wa-card__foto" aria-label={`Ver ${n.nombre}`}>
                    {n.imagenUrl ? <img src={n.imagenUrl} alt="" /> : <span className="wa-card__sinfoto" aria-hidden>🖼️</span>}
                    {abiertoAhora(n.horariosJson) === true && <span className="wa-card__abierto">Abierto ahora</span>}
                  </Link>
                  <button type="button" className={cx('wa-card__fav', esFav && 'activo')} aria-pressed={esFav} aria-label={esFav ? 'Quitar de guardados' : 'Guardar'} onClick={() => (esFav ? favs.quitar(n.id) : favs.agregar(n))}>
                    {esFav ? <IconHeartFill /> : <IconHeart />}
                  </button>
                  <div className="wa-card__cuerpo">
                    <div className="wa-card__meta"><small>{n.subcategoria ?? n.categoria}</small><span className="wa-card__calif"><Estrellas valor={n.calificacion} /> {n.calificacion.toFixed(1)}</span></div>
                    <h3>{n.nombre}</h3>
                    {n.descripcionCorta && <p>{n.descripcionCorta}</p>}
                    <p className="wa-card__lugar"><span><IconPin /> {[n.colonia, n.ciudad].filter(Boolean).join(' · ') || n.direccion}</span>{n.distanciaKm != null && <strong>{n.distanciaKm.toFixed(1)} km</strong>}</p>
                    <Link href={`/negocio/${n.id}`} className="wa-card__ver">Ver detalles y contactar <IconExternal /></Link>
                  </div>
                </article>
              );
            })}
          </div>

          {filtrados.length > 0 && (
            <div className="wa-paginas">
              <small>Mostrando {visibles.length} de {filtrados.length} establecimientos</small>
              {paginas > 1 && (
                <nav aria-label="Páginas">
                  {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => <button key={p} type="button" aria-current={p === pagina ? 'page' : undefined} className={cx(p === pagina && 'activa')} onClick={() => setPagina(p)}>{p}</button>)}
                </nav>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

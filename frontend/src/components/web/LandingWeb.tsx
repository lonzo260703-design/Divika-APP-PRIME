'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Cabecera } from './Cabecera';
import { ImagenOpcional } from './ImagenOpcional';
import { BannerApp, PieSimple } from './Pie';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import type { Negocio } from '@/types';

// Nombres cortos y orden de las categorías como en el diseño
const NOMBRE_CORTO: Record<string, string> = { hogar: 'Hogar', automotriz: 'Automotriz', limpieza: 'Limpieza' };
const ORDEN = ['restaurantes', 'salud', 'hogar', 'cafeterias', 'automotriz', 'tecnologia', 'belleza', 'entretenimiento', 'mascotas', 'limpieza', 'estetica', 'ropa'];
const posicion = (slug: string) => { const i = ORDEN.indexOf(slug); return i < 0 ? ORDEN.length : i; };

const PASOS = [
  ['01', 'Encuentra', 'Busca por servicio, categoría y ubicación.'],
  ['02', 'Conecta', 'Consulta detalles y habla con el proveedor.'],
  ['03', 'Descubre', 'Guarda tus favoritos y organiza tus citas.'],
] as const;

// Contenido del inicio web, diseño "Inicio mejorado" (sin cabecera ni pie: los pone quien lo use)
export function LandingContenido() {
  const router = useRouter();
  const { categorias } = useCategorias();
  const [recomendados, setRecomendados] = useState<Negocio[] | null>(null);
  const [servicio, setServicio] = useState('');
  const [ciudad, setCiudad] = useState('');

  useEffect(() => {
    api<Negocio[]>('/negocios/top').then((n) => setRecomendados(n.slice(0, 6))).catch(() => setRecomendados([]));
  }, []);

  function buscar(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (servicio.trim()) p.set('buscar', servicio.trim());
    if (ciudad.trim()) p.set('ciudad', ciudad.trim());
    router.push(p.size ? `/home?${p}` : '/home?todos=1');
  }

  const nombreCategoria = (slug: string) => categorias.find((c) => c.slug === slug)?.nombre ?? slug;

  return (
    <>
      <section className="ini-hero">
        <div className="ini-ancho ini-hero__grid">
          <div className="ini-hero__texto">
            <p className="ini-ceja">Tu comunidad, más cerca</p>
            <h1>Explora servicios, rápido y seguro.</h1>
            <p>Encuentra lo que necesitas, conecta con negocios locales y descubre tu próximo lugar favorito.</p>
          </div>
          <ImagenOpcional src="/web/hero.jpg" alt="Profesionales de distintos oficios" etiqueta="Imagen: hero.jpg" className="ini-hero__img" />
          <form className="ini-buscador" onSubmit={buscar} role="search">
            <label className="ini-buscador__campo">
              <small>¿Qué necesitas hoy?</small>
              <input value={servicio} onChange={(e) => setServicio(e.target.value)} placeholder="Busca un servicio o negocio" />
            </label>
            <label className="ini-buscador__campo ini-buscador__ubic">
              <small>Ubicación</small>
              <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Durango, México" />
            </label>
            <button type="submit" className="ini-btn">Buscar servicios <span aria-hidden>→</span></button>
          </form>
        </div>
      </section>

      <section className="ini-seccion">
        <div className="ini-ancho">
          <h2>Todo lo que necesitas, en un solo lugar</h2>
          <div className="ini-cats">
            {[...categorias].sort((a, b) => posicion(a.slug) - posicion(b.slug)).map((c) => (
              <Link key={c.slug} href={`/categoria/${c.slug}`} className="ini-cat">{NOMBRE_CORTO[c.slug] ?? c.nombre}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ini-seccion ini-seccion--sin-arriba">
        <div className="ini-ancho">
          <div className="ini-cabeza">
            <div>
              <h2>Recomendaciones</h2>
              <p>Negocios y profesionales para resolver tu día.</p>
            </div>
            <Link href="/home?todos=1" className="ini-enlace">Explorar todos <span aria-hidden>→</span></Link>
          </div>
          {recomendados && recomendados.length === 0 && <p className="ini-vacio">Aún no hay negocios publicados.</p>}
          <div className="ini-recs">
            {recomendados?.map((n) => (
              <article key={n.id} className="ini-rec">
                <div className="ini-rec__foto">{n.imagenUrl ? <img src={n.imagenUrl} alt="" /> : <span>{n.nombre.charAt(0)}</span>}</div>
                <div className="ini-rec__cuerpo">
                  <small>{n.subcategoria ?? nombreCategoria(n.categoria)}</small>
                  <h3>{n.nombre}</h3>
                  <p>{[n.colonia, n.ciudad].filter(Boolean).join(', ') || n.direccion || 'Durango'}</p>
                  <Link href={`/negocio/${n.id}`} className="ini-rec__btn">Contactar <span aria-hidden>→</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ini-pasos" id="como-funciona" aria-label="Cómo funciona">
        <ol className="ini-ancho">
          {PASOS.map(([n, t, d]) => (
            <li key={n}>
              <span className="ini-pasos__num">{n}</span>
              <div><h3>{t}</h3><p>{d}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

// Inicio de la versión web (pública: se ve sin iniciar sesión)
export function LandingWeb() {
  return (
    <div className="web-pagina">
      <Cabecera />
      <LandingContenido />
      <BannerApp />
      <PieSimple />
    </div>
  );
}

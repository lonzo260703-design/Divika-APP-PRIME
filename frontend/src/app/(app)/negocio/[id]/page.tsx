'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NegocioWeb } from '@/components/web/NegocioWeb';
import { useEscritorio } from '@/lib/useEscritorio';
import { Estrellas } from '@/components/negocio/Estrellas';
import { Button } from '@/components/ui/Button';
import { IconBack, IconChat, IconChevron, IconClock, IconHeart, IconHeartFill, IconPhone, IconPin, IconShare } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { formatoTelefono, numeroWhatsapp } from '@/lib/formato';
import { abiertoAhora, resumenHorario } from '@/lib/horario';
import { useFavoritos } from '@/lib/useFavoritos';
import { pesos } from '@/lib/reservas';
import type { NegocioDetalle, Resena, Servicio } from '@/types';

const UMBRAL_BIEN_CALIFICADO = 4.5;

function NegocioMovil() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [negocio, setNegocio] = useState<NegocioDetalle | null>(null);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [foto, setFoto] = useState(0);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const favs = useFavoritos();

  useEffect(() => {
    api<NegocioDetalle>(`/negocios/${id}`).then(setNegocio).catch((e: Error) => setError(e.message));
    api(`/negocios/${id}/visita`, { method: 'POST' }).catch(() => {});
    api<Servicio[]>(`/negocios/${id}/servicios`).then(setServicios).catch(() => setServicios([]));
    api<Resena[]>(`/resenas/negocio/${id}`).then(setResenas).catch(() => setResenas([]));
  }, [id]);

  const volver = () => (window.history.length > 1 ? router.back() : router.push('/home'));
  const proximamente = (txt: string) => {
    setAviso(`${txt} estará disponible muy pronto.`);
    setTimeout(() => setAviso(''), 2500);
  };
  const contar = (tipo: 'whatsapp' | 'llamada') => {
    api(`/negocios/${id}/clic-${tipo}`, { method: 'POST' }).catch(() => {});
  };

  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: negocio?.nombre, url });
      else { await navigator.clipboard.writeText(url); proximamenteAviso('Enlace copiado'); }
    } catch {}
  }
  const proximamenteAviso = (txt: string) => { setAviso(txt); setTimeout(() => setAviso(''), 2500); };

  if (error) {
    return (
      <>
        <button type="button" className="atras" onClick={volver} aria-label="Volver"><IconBack /></button>
        <p className="form__error">{error}</p>
      </>
    );
  }
  if (!negocio) return null;

  const horario = resumenHorario(negocio.horariosJson);
  const abierto = abiertoAhora(negocio.horariosJson);
  const fotos = [negocio.imagenUrl, ...(negocio.galeria ?? [])].filter((u): u is string => !!u);
  const esFav = favs.esFavorito(negocio.id);
  const bien = negocio.calificacion >= UMBRAL_BIEN_CALIFICADO;
  const mapa =
    negocio.latitud != null && negocio.longitud != null
      ? `https://maps.google.com/maps?q=${negocio.latitud},${negocio.longitud}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(negocio.direccion)}&z=15&output=embed`;

  return (
    <div className="detalle">
      <div className="detalle__hero">
        {fotos[foto] ? <img src={fotos[foto]} alt={negocio.nombre} /> : <div className="card__image--vacio">🖼️</div>}
        <button type="button" className="detalle__atras" onClick={volver} aria-label="Volver"><IconBack /></button>
        <div className="detalle__acciones">
          <button type="button" onClick={compartir} aria-label="Compartir"><IconShare /></button>
          <button
            type="button"
            className={esFav ? 'activo' : undefined}
            aria-pressed={esFav}
            aria-label={esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            onClick={() => (esFav ? favs.quitar(negocio.id) : favs.agregar(negocio))}
          >
            {esFav ? <IconHeartFill /> : <IconHeart />}
          </button>
        </div>
      </div>
      {fotos.length > 1 && (
        <div className="galeria">
          {fotos.map((u, i) => (
            <button key={u} type="button" aria-current={i === foto} aria-label={`Foto ${i + 1}`} onClick={() => setFoto(i)}><img src={u} alt="" /></button>
          ))}
        </div>
      )}

      <div className="detalle__cuerpo">
        <div className="detalle__titulo">
          <h1>{negocio.nombre}</h1>
          {bien && <span className="chip-bien">¡Bien calificado!</span>}
        </div>
        {negocio.descripcionCorta && <p className="detalle__desc">{negocio.descripcionCorta}</p>}
        <p className="detalle__linea"><IconPin /> {negocio.direccion}</p>
        {horario.length > 0 && (
          <div className="detalle__linea detalle__horario">
            <IconClock />
            <div>{horario.map((l) => <p key={l}>{l}</p>)}</div>
          </div>
        )}
        <div className="detalle__chips">
          <span className="chip-calif">★ {negocio.calificacion.toFixed(1)}</span>
          {abierto !== null && <span className={`chip-estado${abierto ? '' : ' chip-estado--cerrado'}`}>{abierto ? 'Abierto' : 'Cerrado'}</span>}
        </div>

        <section className="bloque">
          <h2>Habla con el proveedor</h2>
          <div className="contacto">
            <a
              className="contacto__btn"
              href={`https://wa.me/${numeroWhatsapp(negocio.telefono)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => contar('whatsapp')}
            >
              <IconChat /> WhatsApp
            </a>
            <a className="contacto__btn" href={`tel:${negocio.telefono}`} onClick={() => contar('llamada')}>
              <IconPhone /> Llamar
            </a>
          </div>
          <p className="detalle__tel">{formatoTelefono(negocio.telefono)}</p>
          <button type="button" className="enlace-fila" onClick={() => router.push(`/negocio/${negocio.id}/mensajes`)}>
            Enviar mensaje <IconChevron />
          </button>
        </section>

        {servicios.length > 0 && (
          <section className="bloque">
            <h2>Servicios</h2>
            {servicios.map((s) => (
              <div key={s.id} className="servicio-fila">
                {s.fotoUrl && <img src={s.fotoUrl} alt="" className="servicio-foto servicio-foto--chica" />}
                <span><strong>{s.nombre}</strong><small>{[s.categoria, `${s.duracionMin} min`, s.modalidad === 'domicilio' ? 'A domicilio' : s.modalidad === 'ambos' ? 'En el negocio o a domicilio' : null, s.modalidad !== 'local' && s.costoTraslado ? `traslado ${pesos(s.costoTraslado)}` : null, s.descripcion].filter(Boolean).join(' · ')}</small>{s.indicaciones && <small>{s.indicaciones}</small>}</span>
                <strong>{pesos(s.precio)}</strong>
              </div>
            ))}
          </section>
        )}

        {!!negocio.metodosPago?.length && (
          <section className="bloque">
            <h2>Formas de pago</h2>
            <p>{negocio.metodosPago.map((m) => ({ efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta' }[m] ?? m)).join(' · ')}</p>
            {negocio.instruccionesPago && <p className="pantalla-nota">{negocio.instruccionesPago}</p>}
            <p className="pantalla-nota">El pago se arregla directamente con el negocio; Divika no procesa pagos.</p>
          </section>
        )}

        <section className="bloque">
          <h2>Ubicación</h2>
          {negocio.referencias && <p className="pantalla-nota">{negocio.referencias}</p>}
          <iframe className="mapa" title={`Mapa de ${negocio.nombre}`} src={mapa} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <p className="detalle__linea"><IconPin /> {negocio.direccion}</p>
        </section>

        <section className="bloque">
          <h2>Reseñas</h2>
          {resenas.length === 0 ? (
            <p className="detalle__vacio">Aún no hay reseñas.</p>
          ) : (
            resenas.slice(0, 2).map((r) => (
              <div key={r.id} className="resena">
                <div className="resena__cab"><strong>{r.usuario.nombre}</strong><Estrellas valor={r.calificacion} /></div>
                {r.comentario && <p>{r.comentario}</p>}
                {r.respuesta && <p className="resena__respuesta"><strong>Respuesta del negocio:</strong> {r.respuesta}</p>}
              </div>
            ))
          )}
          {resenas.length > 2 && (
            <button type="button" className="enlace-fila" onClick={() => proximamente('Ver todas las reseñas')}>
              Ver todas las reseñas <IconChevron />
            </button>
          )}
        </section>

      </div>
      <div className="barra-reserva">
        <span><small>Agenda tu cita</small><strong>Reserva en línea</strong></span>
        <Button onClick={() => router.push(`/negocio/${negocio.id}/reservar`)}>Ver fechas</Button>
      </div>
      {aviso && <div className="toast" role="status">{aviso}</div>}
    </div>
  );
}


export default function NegocioPage() {
  const { id } = useParams<{ id: string }>();
  const escritorio = useEscritorio();
  if (escritorio === null) return null;
  return escritorio ? <NegocioWeb key={id} id={id} /> : <NegocioMovil />;
}

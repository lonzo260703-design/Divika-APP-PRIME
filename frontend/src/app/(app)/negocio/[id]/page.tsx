'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Estrellas } from '@/components/negocio/Estrellas';
import { IconBack, IconChat, IconChevron, IconClock, IconPhone, IconPin } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { formatoTelefono, numeroWhatsapp } from '@/lib/formato';
import { resumenHorario } from '@/lib/horario';
import type { NegocioDetalle, Resena } from '@/types';

const UMBRAL_BIEN_CALIFICADO = 4.5;

export default function NegocioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [negocio, setNegocio] = useState<NegocioDetalle | null>(null);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api<NegocioDetalle>(`/negocios/${id}`).then(setNegocio).catch((e: Error) => setError(e.message));
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
  const bien = negocio.calificacion >= UMBRAL_BIEN_CALIFICADO;
  const mapa =
    negocio.latitud != null && negocio.longitud != null
      ? `https://maps.google.com/maps?q=${negocio.latitud},${negocio.longitud}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(negocio.direccion)}&z=15&output=embed`;

  return (
    <div className="detalle">
      <div className="detalle__hero">
        {negocio.imagenUrl ? <img src={negocio.imagenUrl} alt={negocio.nombre} /> : <div className="card__image--vacio">🖼️</div>}
        <button type="button" className="detalle__atras" onClick={volver} aria-label="Volver"><IconBack /></button>
      </div>

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
        <div className="detalle__calif">
          <Estrellas valor={negocio.calificacion} />
          <strong>{negocio.calificacion.toFixed(1)}</strong>
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
          <button type="button" className="enlace-fila" onClick={() => proximamente('Enviar mensaje')}>
            Enviar mensaje <IconChevron />
          </button>
        </section>

        <section className="bloque">
          <h2>Ubicación</h2>
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
              </div>
            ))
          )}
          {resenas.length > 2 && (
            <button type="button" className="enlace-fila" onClick={() => proximamente('Ver todas las reseñas')}>
              Ver todas las reseñas <IconChevron />
            </button>
          )}
        </section>

        <section className="bloque">
          <h2>Reservar</h2>
          <button type="button" className="enlace-fila" onClick={() => proximamente('Reservar')}>
            Ver fechas <IconChevron />
          </button>
        </section>
      </div>
      {aviso && <div className="toast" role="status">{aviso}</div>}
    </div>
  );
}

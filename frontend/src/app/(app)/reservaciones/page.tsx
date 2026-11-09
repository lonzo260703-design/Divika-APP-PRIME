'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { IconCalendar } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { ESTADO_CITA, fechaLarga, vigente } from '@/lib/reservas';
import type { Cita } from '@/types';

export default function ReservacionesPage() {
  const [lista, setLista] = useState<Cita[] | null>(null);
  const [error, setError] = useState('');
  const cargar = useCallback(() => api<Cita[]>('/citas/mias').then(setLista).catch((e: Error) => { setError(e.message); setLista([]); }), []);
  useEffect(() => { cargar(); }, [cargar]);

  async function accion(id: number, ruta: 'cancelar' | 'aceptar-propuesta') {
    setError('');
    try {
      await api(`/citas/${id}/${ruta}`, { method: 'POST' });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar');
    }
  }

  const proximas = lista?.filter(vigente).sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)) ?? [];
  const historial = lista?.filter((c) => !vigente(c)) ?? [];

  const tarjeta = (c: Cita) => (
    <div key={c.id} className="cita">
      <div className="cita__cab">
        <Link href={`/negocio/${c.negocio.id}`}><strong>{c.negocio.nombre}</strong></Link>
        <span className={`chip-estado${c.estado === 'confirmada' ? '' : c.estado === 'solicitada' ? ' chip-estado--pendiente' : c.estado === 'propuesta' ? ' chip-estado--propuesta' : ' chip-estado--cerrado'}`}>{ESTADO_CITA[c.estado]}</span>
      </div>
      <small>{fechaLarga(c.fecha)} · {c.hora} h · {c.personas} {c.personas === 1 ? 'persona' : 'personas'}{c.servicio ? ` · ${c.servicio.nombre}` : ''}</small>
      {c.estado === 'propuesta' && c.propuestaFecha && (
        <small><strong>El negocio propone:</strong> {fechaLarga(c.propuestaFecha)} · {c.propuestaHora} h</small>
      )}
      <div className="cita__acciones">
        {c.estado === 'propuesta' && <button type="button" className="btn btn--primary" onClick={() => accion(c.id, 'aceptar-propuesta')}>Aceptar nuevo horario</button>}
        {vigente(c) && <button type="button" className="enlace-boton enlace-boton--rojo" onClick={() => accion(c.id, 'cancelar')}>Cancelar</button>}
        <Link href={`/negocio/${c.negocio.id}/mensajes`} className="enlace-boton">Escribir al negocio</Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="cabecera"><h1 className="titulo">Reservaciones</h1></div>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      {lista && lista.length === 0 && (
        <div className="fav-vacio">
          <span className="fav-vacio__icono"><IconCalendar /></span>
          <h2>Aún no tienes reservaciones</h2>
          <p>Entra a un negocio y toca “Ver fechas” para reservar.</p>
          <Link href="/home" className="enlace-boton">Explorar negocios</Link>
        </div>
      )}
      {proximas.length > 0 && <><h2 className="seccion-titulo">Próximas</h2>{proximas.map(tarjeta)}</>}
      {historial.length > 0 && <><h2 className="seccion-titulo">Historial</h2>{historial.map(tarjeta)}</>}
    </>
  );
}

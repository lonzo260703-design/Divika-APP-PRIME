'use client';

import { useCallback, useEffect, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { api } from '@/lib/api';
import { ESTADO_CITA, fechaCorta, fechaLarga, iso, pesos } from '@/lib/reservas';
import { useEscritorio } from '@/lib/useEscritorio';
import type { Cita } from '@/types';

type Pestana = 'solicitudes' | 'confirmadas' | 'historial';

export default function Solicitudes() {
  const [citas, setCitas] = useState<Cita[] | null>(null);
  const [tab, setTab] = useState<Pestana>('solicitudes');
  const [proponiendo, setProponiendo] = useState<number | null>(null);
  const [pf, setPf] = useState('');
  const [ph, setPh] = useState('');
  const [error, setError] = useState('');
  const [sel, setSel] = useState<number | null>(null);
  const escritorio = useEscritorio() === true;

  const cargar = useCallback(() => api<Cita[]>('/proveedor/citas').then(setCitas).catch((e: Error) => { setError(e.message); setCitas([]); }), []);
  useEffect(() => { cargar(); }, [cargar]);

  async function ir(id: number, ruta: string, body?: unknown) {
    setError('');
    try {
      await api(`/proveedor/citas/${id}/${ruta}`, { method: 'POST', body });
      setProponiendo(null);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar');
    }
  }

  const hoy = iso(new Date());
  const filtro: Record<Pestana, (c: Cita) => boolean> = {
    solicitudes: (c) => c.estado === 'solicitada' || c.estado === 'propuesta',
    confirmadas: (c) => c.estado === 'confirmada' && c.fecha >= hoy,
    historial: (c) => c.estado === 'rechazada' || c.estado === 'cancelada' || (c.estado === 'confirmada' && c.fecha < hoy),
  };
  const lista = (citas ?? []).filter(filtro[tab]);
  const cuenta = (t: Pestana) => (citas ?? []).filter(filtro[t]).length;

  const tarjeta = (c: Cita) => (
        <div key={c.id} className="cita">
          <div className="cita__cab">
            <strong>{c.cliente.nombre}</strong>
            <span className={`chip-estado${c.estado === 'confirmada' ? '' : c.estado === 'solicitada' ? ' chip-estado--pendiente' : c.estado === 'propuesta' ? ' chip-estado--propuesta' : ' chip-estado--cerrado'}`}>{ESTADO_CITA[c.estado]}</span>
          </div>
          <small>{fechaLarga(c.fecha)} · {c.hora} h · {c.personas} {c.personas === 1 ? 'persona' : 'personas'}</small>
          {c.servicio && <small>{c.servicio.nombre} · {pesos(c.servicio.precio)}</small>}
          {c.metodoPago && <small>Pago: {c.metodoPago}</small>}
          {c.notas && <small>“{c.notas}”</small>}
          {c.estado === 'propuesta' && c.propuestaFecha && <small>Propusiste: {fechaLarga(c.propuestaFecha)} · {c.propuestaHora} h (esperando al cliente)</small>}
          <div className="cita__acciones">
            {c.estado === 'solicitada' && (
              <>
                <button type="button" className="p-btn" onClick={() => ir(c.id, 'confirmar')}>Confirmar</button>
                <button type="button" className="p-btn p-btn--borde" onClick={() => { setProponiendo(proponiendo === c.id ? null : c.id); setPf(c.fecha); setPh(c.hora); }}>Proponer horario</button>
                <button type="button" className="p-btn p-btn--borde" onClick={() => ir(c.id, 'rechazar')}>Rechazar</button>
              </>
            )}
            {(c.estado === 'confirmada' || c.estado === 'propuesta') && c.fecha >= hoy && (
              <button type="button" className="p-btn p-btn--borde" onClick={() => api(`/citas/${c.id}/cancelar`, { method: 'POST' }).then(cargar).catch((e: Error) => setError(e.message))}>Cancelar cita</button>
            )}
            <a className="p-btn p-btn--borde" href={`/portal/mensajes/${c.cliente.id}`}>Mensaje</a>
          </div>
          {proponiendo === c.id && (
            <div className="cita__propuesta">
              <input type="date" min={hoy} value={pf} onChange={(e) => setPf(e.target.value)} aria-label="Fecha propuesta" />
              <input type="time" value={ph} onChange={(e) => setPh(e.target.value)} aria-label="Hora propuesta" />
              <button type="button" className="p-btn" disabled={!pf || !ph} onClick={() => ir(c.id, 'proponer', { fecha: pf, hora: ph })}>Enviar propuesta</button>
            </div>
          )}
        </div>
  );

  const elegida = lista.find((c) => c.id === sel) ?? lista[0] ?? null;
  const chip = (c: Cita) => `chip-estado${c.estado === 'confirmada' ? '' : c.estado === 'solicitada' ? ' chip-estado--pendiente' : c.estado === 'propuesta' ? ' chip-estado--propuesta' : ' chip-estado--cerrado'}`;

  return (
    <div className={escritorio ? 'p-ancho' : 'p-estrecho'}>
      <h1 className="p-titulo">Solicitudes y citas</h1>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <div className="tabs" role="tablist">
        {(['solicitudes', 'confirmadas', 'historial'] as Pestana[]).map((t) => (
          <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === 'solicitudes' ? 'Solicitudes' : t === 'confirmadas' ? 'Confirmadas' : 'Historial'} ({cuenta(t)})
          </button>
        ))}
      </div>
      {escritorio ? (
        <div className="p-maestro">
          <div className="p-tarjeta">
            {lista.map((c) => (
              <button key={c.id} type="button" className={`p-fila-sel${elegida?.id === c.id ? ' p-fila-sel--on' : ''}`} onClick={() => setSel(c.id)}>
                <span className="p-avatar p-avatar--chico">{c.cliente.nombre.charAt(0).toUpperCase()}</span>
                <span><strong>{c.cliente.nombre}</strong><small>{c.servicio?.nombre ?? 'Cita'} · {fechaCorta(c.fecha)} · {c.hora} h</small></span>
                <span className={chip(c)}>{ESTADO_CITA[c.estado]}</span>
              </button>
            ))}
            {citas && lista.length === 0 && <p className="p-sub">No hay nada aquí por ahora.</p>}
          </div>
          <div>{elegida ? tarjeta(elegida) : <p className="p-sub">Elige una solicitud para ver el detalle.</p>}</div>
        </div>
      ) : (
        <>
          {citas && lista.length === 0 && <p className="p-sub">No hay nada aquí por ahora.</p>}
          {lista.map(tarjeta)}
        </>
      )}
    </div>
  );
}

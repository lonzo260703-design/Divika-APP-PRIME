'use client';

import { useEffect, useMemo, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { api } from '@/lib/api';
import { cx } from '@/lib/cx';
import { fechaLarga, iso, pesos } from '@/lib/reservas';
import type { Cita } from '@/types';

// Agenda: próximos 14 días con las citas confirmadas de cada uno
export default function Calendario() {
  const [citas, setCitas] = useState<Cita[] | null>(null);
  const [error, setError] = useState('');
  const [dia, setDia] = useState(iso(new Date()));
  useEffect(() => { api<Cita[]>('/proveedor/citas').then(setCitas).catch((e: Error) => { setError(e.message); setCitas([]); }); }, []);

  const dias = useMemo(() => {
    const h = new Date();
    return Array.from({ length: 14 }, (_, i) => new Date(h.getFullYear(), h.getMonth(), h.getDate() + i));
  }, []);
  const confirmadas = (citas ?? []).filter((c) => c.estado === 'confirmada');
  const delDia = confirmadas.filter((c) => c.fecha === dia).sort((a, b) => a.hora.localeCompare(b.hora));
  const pendientes = (citas ?? []).filter((c) => c.estado === 'solicitada').length;

  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Calendario</h1>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      {pendientes > 0 && <p className="p-sub">Tienes {pendientes} solicitud{pendientes === 1 ? '' : 'es'} por responder en Solicitudes y citas.</p>}
      <div className="dias">
        {dias.map((d) => {
          const f = iso(d);
          const n = confirmadas.filter((c) => c.fecha === f).length;
          return (
            <button key={f} type="button" aria-pressed={dia === f} className={cx('dia', dia === f && 'dia--activo')} onClick={() => setDia(f)}>
              <small>{d.toLocaleDateString('es-MX', { weekday: 'short' })}</small>
              <strong>{d.getDate()}</strong>
              <small>{n > 0 ? `${n} cita${n === 1 ? '' : 's'}` : '—'}</small>
            </button>
          );
        })}
      </div>
      <h2 className="seccion-titulo">{fechaLarga(dia)}</h2>
      {citas && delDia.length === 0 && <p className="p-sub">Sin citas confirmadas este día.</p>}
      {delDia.map((c) => (
        <div key={c.id} className="cita">
          <div className="cita__cab"><strong>{c.hora} h · {c.cliente.nombre}</strong><small>{c.personas} {c.personas === 1 ? 'persona' : 'personas'}</small></div>
          {c.servicio && <small>{c.servicio.nombre} · {pesos(c.servicio.precio)} · {c.servicio.duracionMin} min</small>}
          {c.notas && <small>“{c.notas}”</small>}
        </div>
      ))}
    </div>
  );
}

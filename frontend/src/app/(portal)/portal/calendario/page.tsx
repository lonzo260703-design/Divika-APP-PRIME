'use client';

import { useEffect, useMemo, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { api } from '@/lib/api';
import { cx } from '@/lib/cx';
import { fechaLarga, iso, pesos } from '@/lib/reservas';
import { useEscritorio } from '@/lib/useEscritorio';
import type { Cita } from '@/types';

const SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Calendario mensual con las citas confirmadas; al elegir un día se ve su agenda
export default function Calendario() {
  const escritorio = useEscritorio() === true;
  const [citas, setCitas] = useState<Cita[] | null>(null);
  const [error, setError] = useState('');
  const [dia, setDia] = useState(iso(new Date()));
  const [mes, setMes] = useState(() => { const h = new Date(); return new Date(h.getFullYear(), h.getMonth(), 1); });
  useEffect(() => { api<Cita[]>('/proveedor/citas').then(setCitas).catch((e: Error) => { setError(e.message); setCitas([]); }); }, []);

  const confirmadas = (citas ?? []).filter((c) => c.estado === 'confirmada');
  const celdas = useMemo(() => {
    const inicio = (mes.getDay() + 6) % 7; // lunes = 0
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    return [...Array(inicio).fill(null), ...Array.from({ length: total }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1))];
  }, [mes]);
  const delDia = confirmadas.filter((c) => c.fecha === dia).sort((a, b) => a.hora.localeCompare(b.hora));
  const pendientes = (citas ?? []).filter((c) => c.estado === 'solicitada').length;
  const hoy = iso(new Date());

  const panel = (
    <div className="p-tarjeta">
      <h2 style={{ textTransform: 'capitalize' }}>{fechaLarga(dia)}</h2>
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

  return (
    <div className={escritorio ? 'p-ancho' : 'p-estrecho'}>
      <h1 className="p-titulo">Calendario</h1>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      {pendientes > 0 && <p className="p-sub">Tienes {pendientes} solicitud{pendientes === 1 ? '' : 'es'} por responder en Solicitudes y citas.</p>}
      <div className={escritorio ? 'p-dos' : undefined}>
        <div className="p-tarjeta">
          <div className="p-fila-cab">
            <button type="button" className="p-btn p-btn--borde" aria-label="Mes anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>‹</button>
            <h2 style={{ textTransform: 'capitalize' }}>{mes.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</h2>
            <button type="button" className="p-btn p-btn--borde" aria-label="Mes siguiente" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="mes">
            {SEMANA.map((d) => <small key={d} className="mes__sem">{d}</small>)}
            {celdas.map((d, i) => {
              if (!d) return <span key={`v${i}`} />;
              const f = iso(d);
              const n = confirmadas.filter((c) => c.fecha === f).length;
              return (
                <button key={f} type="button" aria-pressed={dia === f} className={cx('mes__dia', dia === f && 'mes__dia--sel', f === hoy && 'mes__dia--hoy')} onClick={() => setDia(f)}>
                  {d.getDate()}
                  {n > 0 && <i>{n}</i>}
                </button>
              );
            })}
          </div>
        </div>
        {panel}
      </div>
    </div>
  );
}

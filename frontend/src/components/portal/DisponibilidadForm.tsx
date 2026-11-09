'use client';

import { useEffect, useState } from 'react';
import { Aviso } from '../ui/Aviso';
import { Interruptor } from '../ui/Interruptor';
import { api } from '@/lib/api';
import type { Disponibilidad } from '@/types';

const DIAS: [string, string][] = [['lunes', 'Lunes'], ['martes', 'Martes'], ['miercoles', 'Miércoles'], ['jueves', 'Jueves'], ['viernes', 'Viernes'], ['sabado', 'Sábado'], ['domingo', 'Domingo']];

// Horario semanal, fechas bloqueadas y reglas con las que se ofrecen las horas a los clientes
export function DisponibilidadForm({ onGuardado }: { onGuardado?: (d: Disponibilidad) => void }) {
  const [d, setD] = useState<Disponibilidad | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  useEffect(() => { api<Disponibilidad>('/proveedor/disponibilidad').then((r) => { setD(r); onGuardado?.(r); }).catch((e: Error) => setError(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return error ? <Aviso onClose={() => setError('')}>{error}</Aviso> : null;

  const cambiar = (fn: (x: Disponibilidad) => Disponibilidad) => { setOk(''); setD(fn(d)); };
  const num = (v: string) => (v === '' ? 0 : Number(v));

  async function guardar() {
    setError(''); setOk(''); setGuardando(true);
    try {
      const r = await api<Disponibilidad>('/proveedor/disponibilidad', { method: 'PUT', body: d });
      setD(r); onGuardado?.(r); setOk('Disponibilidad guardada');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally { setGuardando(false); }
  }

  return (
    <div className="p-col">
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <section className="p-tarjeta">
        <h2>Horario semanal</h2>
        <p className="p-sub">Los clientes solo pueden pedir citas dentro de estas horas.</p>
        {DIAS.map(([k, t]) => {
          const h = d.horarios[k];
          return (
            <div key={k} className="disp-fila">
              <strong>{t}</strong>
              <Interruptor activo={!h.cerrado} etiqueta={`${t} abierto`} onChange={(v) => cambiar((x) => ({ ...x, horarios: { ...x.horarios, [k]: { ...h, cerrado: !v } } }))} />
              {h.cerrado ? <small>Cerrado</small> : (
                <span className="disp-horas">
                  <input type="time" aria-label={`${t} apertura`} value={h.apertura} onChange={(e) => cambiar((x) => ({ ...x, horarios: { ...x.horarios, [k]: { ...h, apertura: e.target.value } } }))} />
                  <span>a</span>
                  <input type="time" aria-label={`${t} cierre`} value={h.cierre} onChange={(e) => cambiar((x) => ({ ...x, horarios: { ...x.horarios, [k]: { ...h, cierre: e.target.value } } }))} />
                </span>
              )}
            </div>
          );
        })}
      </section>

      <section className="p-tarjeta">
        <h2>Fechas bloqueadas</h2>
        <p className="p-sub">Vacaciones, mantenimiento… Los clientes no verán horas en esos días. Las citas ya confirmadas no se mueven.</p>
        {d.bloqueos.map((b, i) => (
          <div key={i} className="disp-bloqueo">
            <input type="date" aria-label="Desde" value={b.desde} onChange={(e) => cambiar((x) => ({ ...x, bloqueos: x.bloqueos.map((y, j) => (j === i ? { ...y, desde: e.target.value, hasta: y.hasta < e.target.value ? e.target.value : y.hasta } : y)) }))} />
            <input type="date" aria-label="Hasta" min={b.desde} value={b.hasta} onChange={(e) => cambiar((x) => ({ ...x, bloqueos: x.bloqueos.map((y, j) => (j === i ? { ...y, hasta: e.target.value } : y)) }))} />
            <input aria-label="Motivo" placeholder="Motivo (opcional)" maxLength={60} value={b.motivo} onChange={(e) => cambiar((x) => ({ ...x, bloqueos: x.bloqueos.map((y, j) => (j === i ? { ...y, motivo: e.target.value } : y)) }))} />
            <button type="button" className="p-enlace" onClick={() => cambiar((x) => ({ ...x, bloqueos: x.bloqueos.filter((_, j) => j !== i) }))}>Quitar</button>
          </div>
        ))}
        <button type="button" className="p-btn p-btn--borde" onClick={() => { const hoy = new Date().toISOString().slice(0, 10); cambiar((x) => ({ ...x, bloqueos: [...x.bloqueos, { desde: hoy, hasta: hoy, motivo: '' }] })); }}>Agregar bloqueo</button>
      </section>

      <section className="p-tarjeta">
        <h2>Reglas de disponibilidad</h2>
        <div className="p-form">
          <label className="p-campo">Duración base (min)
            <input type="number" min={15} max={480} value={d.reglas.duracionBase} onChange={(e) => cambiar((x) => ({ ...x, reglas: { ...x.reglas, duracionBase: num(e.target.value) } }))} />
            <small>Se usa cuando la cita no tiene un servicio con duración.</small>
          </label>
          <label className="p-campo">Intervalo entre citas
            <select value={d.reglas.intervaloMin} onChange={(e) => cambiar((x) => ({ ...x, reglas: { ...x.reglas, intervaloMin: Number(e.target.value) } }))}>
              <option value={15}>Cada 15 minutos</option><option value={30}>Cada 30 minutos</option><option value={60}>Cada hora</option>
            </select>
          </label>
          <label className="p-campo">Anticipación mínima (horas)
            <input type="number" min={0} max={168} value={d.reglas.anticipacionHoras} onChange={(e) => cambiar((x) => ({ ...x, reglas: { ...x.reglas, anticipacionHoras: num(e.target.value) } }))} />
          </label>
          <label className="p-campo">Mostrar disponibilidad (días)
            <input type="number" min={1} max={180} value={d.reglas.maxDias} onChange={(e) => cambiar((x) => ({ ...x, reglas: { ...x.reglas, maxDias: num(e.target.value) } }))} />
          </label>
        </div>
      </section>

      {ok && <p className="p-sub" role="status">{ok}</p>}
      <button type="button" className="p-btn" disabled={guardando} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar disponibilidad'}</button>
    </div>
  );
}

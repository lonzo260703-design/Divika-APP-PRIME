'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IconCalendar, IconCheck, IconShield } from '../ui/icons';
import { api } from '@/lib/api';
import { cx } from '@/lib/cx';
import { NOMBRE_PAGO, fechaLarga, iso, pesos } from '@/lib/reservas';
import type { Cita, NegocioDetalle, OfertaDia, Servicio } from '@/types';

const CLAVES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Tarjeta de reserva del detalle web: servicio, lugar, fecha y hora en un solo lugar
export function ReservaLinea({ negocio, servicios }: { negocio: NegocioDetalle; servicios: Servicio[] }) {
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [lugar, setLugar] = useState<'local' | 'domicilio'>('local');
  const [direccion, setDireccion] = useState('');
  const [personas, setPersonas] = useState(1);
  const [metodo, setMetodo] = useState('');
  const [mes, setMes] = useState(() => { const h = new Date(); return new Date(h.getFullYear(), h.getMonth(), 1); });
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [oferta, setOferta] = useState<OfertaDia | null>(null);
  const [cita, setCita] = useState<Cita | null>(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { if (servicios.length === 1) setServicioId(servicios[0].id); }, [servicios]);

  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  useEffect(() => { if (servicio) setLugar(servicio.modalidad === 'domicilio' ? 'domicilio' : 'local'); }, [servicio]);
  const aDomicilio = !!servicio && (servicio.modalidad === 'domicilio' || (servicio.modalidad === 'ambos' && lugar === 'domicilio'));
  const traslado = aDomicilio ? servicio?.costoTraslado ?? 0 : 0;

  useEffect(() => {
    if (!fecha) return;
    setOferta(null); setHora('');
    api<OfertaDia>(`/negocios/${negocio.id}/disponibilidad?fecha=${fecha}${servicioId ? `&servicioId=${servicioId}` : ''}`).then(setOferta).catch(() => {});
  }, [negocio.id, fecha, servicioId]);

  const hoy = iso(new Date());
  const celdas = useMemo(() => {
    const primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    return [...Array(primero.getDay()).fill(null), ...Array.from({ length: total }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1))] as (Date | null)[];
  }, [mes]);
  // Sin horario capturado el negocio ofrece todos los días; el servidor confirma cada fecha
  const abreEseDia = (d: Date) => { const h = negocio.horariosJson?.[CLAVES[d.getDay()]]; return !negocio.horariosJson || (!!h && !h.cerrado); };
  const mesActual = new Date().getFullYear() * 12 + new Date().getMonth();
  const faltan = (servicios.length > 0 && !servicio) || !fecha || !hora || (aDomicilio && !direccion.trim());
  const pagos = negocio.metodosPago ?? [];

  async function enviar() {
    setError(''); setEnviando(true);
    try {
      const notas = aDomicilio ? `Servicio a domicilio. Dirección: ${direccion.trim()}` : undefined;
      setCita(await api<Cita>('/citas', { method: 'POST', body: { negocioId: negocio.id, servicioId: servicioId ?? undefined, fecha, hora, personas, notas, metodoPago: metodo || undefined } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud');
    } finally { setEnviando(false); }
  }

  if (cita) {
    return (
      <aside className="wa-reserva" id="reservar">
        <div className="wa-reserva__ok">
          <span className="wa-reserva__check"><IconCheck /></span>
          <h2>Solicitud enviada</h2>
          <p>{fechaLarga(cita.fecha)} · {cita.hora} h{servicio ? ` · ${servicio.nombre}` : ''}</p>
          <p className="wa-nota">{negocio.nombre} revisará tu solicitud y te responderá. Te avisaremos en la app.</p>
          <Link href="/reservaciones" className="wa-btn-primario">Ver mis reservaciones</Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="wa-reserva" id="reservar" aria-label="Reservar">
      <header className="wa-reserva__cab">
        <span className="wa-reserva__icono"><IconCalendar /></span>
        <div><h2>Reserva tu cita</h2><p>Elige cuándo ir. El negocio revisará tu solicitud antes de confirmar.</p></div>
      </header>

      {servicios.length > 0 && (
        <label className="wa-campo">Servicio
          <select value={servicioId ?? ''} onChange={(e) => setServicioId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Elige un servicio</option>
            {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} · {pesos(s.precio)}</option>)}
          </select>
        </label>
      )}

      {servicio && servicio.modalidad !== 'local' && (
        <div className="wa-campo">Modalidad
          <div className="wa-dos" role="radiogroup" aria-label="Modalidad">
            {servicio.modalidad === 'ambos' && <button type="button" role="radio" aria-checked={lugar === 'local'} className={cx(lugar === 'local' && 'activa')} onClick={() => setLugar('local')}>En el negocio</button>}
            <button type="button" role="radio" aria-checked={aDomicilio} className={cx(aDomicilio && 'activa')} onClick={() => setLugar('domicilio')}>A domicilio</button>
          </div>
          {!!servicio.costoTraslado && <small>Traslado: +{pesos(servicio.costoTraslado)}. Se paga directamente al negocio.</small>}
        </div>
      )}
      {aDomicilio && <label className="wa-campo">Tu dirección<input value={direccion} maxLength={200} placeholder="Calle, número y colonia" onChange={(e) => setDireccion(e.target.value)} /></label>}
      {servicio?.indicaciones && <p className="wa-nota">{servicio.indicaciones}</p>}

      <label className="wa-campo">Personas
        <select value={personas} onChange={(e) => setPersonas(Number(e.target.value))}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
        </select>
      </label>

      <div className="wa-campo">Elige un día disponible
        <div className="wa-mes">
          <div className="wa-mes__cab">
            <button type="button" aria-label="Mes anterior" disabled={mes.getFullYear() * 12 + mes.getMonth() <= mesActual} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>‹</button>
            <strong>{mes.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</strong>
            <button type="button" aria-label="Mes siguiente" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="wa-mes__grid">
            {SEMANA.map((d) => <small key={d}>{d}</small>)}
            {celdas.map((d, i) => {
              if (!d) return <span key={`v${i}`} />;
              const f = iso(d);
              const libre = f >= hoy && abreEseDia(d);
              return <button key={f} type="button" disabled={!libre} aria-pressed={fecha === f} className={cx('wa-dia', fecha === f && 'wa-dia--sel')} onClick={() => setFecha(f)}>{d.getDate()}</button>;
            })}
          </div>
        </div>
      </div>

      {fecha && (
        <div className="wa-campo">{fechaLarga(fecha)}
          {!oferta && <small>Buscando horarios…</small>}
          {oferta && !oferta.abierto && <small>{oferta.motivo ?? 'Sin disponibilidad ese día.'}</small>}
          {oferta?.abierto && (
            <>
              <div className="wa-horas">
                {oferta.horas.map((h) => <button key={h.hora} type="button" disabled={!h.libre} aria-pressed={hora === h.hora} className={cx(hora === h.hora && 'activa')} onClick={() => setHora(h.hora)}>{h.hora}</button>)}
              </div>
              {oferta.horas.every((h) => !h.libre) && <small>No quedan horarios este día.</small>}
            </>
          )}
        </div>
      )}

      {pagos.length > 0 && (
        <label className="wa-campo">Forma de pago preferida (opcional)
          <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="">Lo acuerdo con el negocio</option>
            {pagos.map((m) => <option key={m} value={m}>{NOMBRE_PAGO[m] ?? m}</option>)}
          </select>
        </label>
      )}

      <div className="wa-resumen">
        <strong>Tu selección</strong>
        <p>{fecha && hora ? `${fechaLarga(fecha)} · ${hora} h${aDomicilio ? ' · A domicilio' : ''}` : 'Elige día y hora'}</p>
        {servicio && <div><span>{servicio.nombre}</span><span>{pesos(servicio.precio)}</span></div>}
        {traslado > 0 && <div><span>Traslado</span><span>{pesos(traslado)}</span></div>}
        <div className="wa-resumen__total"><span>Total estimado</span><strong>{servicio && servicio.precio != null ? pesos(servicio.precio + traslado) : 'A consultar'}</strong></div>
      </div>

      {error && <p className="form__error">{error}</p>}
      <button type="button" className="wa-btn-primario" disabled={faltan || enviando} onClick={enviar}>{enviando ? 'Enviando…' : 'Solicitar cita'}</button>
      <p className="wa-nota wa-nota--centro">Aún no es una reserva confirmada. Divika no cobra: el pago se acuerda con el negocio.</p>
      <p className="wa-nota"><IconShield /> Puedes cancelar o pedir cambios desde Reservaciones.</p>
    </aside>
  );
}

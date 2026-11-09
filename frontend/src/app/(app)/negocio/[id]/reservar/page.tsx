'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { Button } from '@/components/ui/Button';
import { IconBack, IconCheck } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { cx } from '@/lib/cx';
import { NOMBRE_PAGO, diasDisponibles, fechaLarga, pesos } from '@/lib/reservas';
import type { Cita, NegocioDetalle, OfertaDia, Servicio } from '@/types';

const PASOS = ['Fecha', 'Detalles', 'Resumen', 'Pago', 'Listo'];

export default function ReservarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [negocio, setNegocio] = useState<NegocioDetalle | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [oferta, setOferta] = useState<OfertaDia | null>(null);
  const [paso, setPaso] = useState(0);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [personas, setPersonas] = useState(1);
  const [notas, setNotas] = useState('');
  const [metodo, setMetodo] = useState('');
  const [cita, setCita] = useState<Cita | null>(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api<NegocioDetalle>(`/negocios/${id}`).then(setNegocio).catch(() => router.replace('/home'));
    api<Servicio[]>(`/negocios/${id}/servicios`).then(setServicios).catch(() => setServicios([]));
  }, [id, router]);

  useEffect(() => {
    if (!fecha) return;
    setOferta(null);
    api<OfertaDia>(`/negocios/${id}/disponibilidad?fecha=${fecha}`).then(setOferta).catch(() => {});
  }, [id, fecha]);

  const dias = useMemo(() => diasDisponibles(negocio?.horariosJson ?? null), [negocio]);
  if (!negocio) return null;
  const dia = dias.find((d) => d.fecha === fecha);
  const horas = oferta?.horas ?? [];
  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  const pagos = negocio.metodosPago ?? [];

  async function confirmar() {
    setError('');
    setEnviando(true);
    try {
      setCita(await api<Cita>('/citas', { method: 'POST', body: { negocioId: negocio!.id, servicioId: servicioId ?? undefined, fecha, hora, personas, notas: notas || undefined, metodoPago: metodo || undefined } }));
      setPaso(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  }
  const atras = () => (paso === 0 ? router.push(`/negocio/${id}`) : setPaso(paso - 1));

  return (
    <div className="reservar">
      <div className="cabecera">
        <button type="button" className="atras" onClick={atras} aria-label="Volver" style={{ visibility: paso === 4 ? 'hidden' : 'visible' }}><IconBack /></button>
        <h1 className="titulo">Reservar</h1>
      </div>
      <ol className="pasos" aria-label="Progreso">
        {PASOS.map((p, i) => <li key={p} className={cx(i === paso && 'pasos--actual', i < paso && 'pasos--hecho')}>{p}</li>)}
      </ol>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}

      {paso === 0 && (
        <>
          <h2 className="seccion-titulo">Elige el día</h2>
          <div className="dias">
            {dias.map((d) => (
              <button key={d.fecha} type="button" disabled={!d.horario} aria-pressed={fecha === d.fecha} className={cx('dia', fecha === d.fecha && 'dia--activo')} onClick={() => { setFecha(d.fecha); setHora(''); }}>
                <small>{d.date.toLocaleDateString('es-MX', { weekday: 'short' })}</small>
                <strong>{d.date.getDate()}</strong>
              </button>
            ))}
          </div>
          {fecha && oferta && !oferta.abierto && <p className="pantalla-nota">{oferta.motivo ?? 'Sin disponibilidad ese día.'}</p>}
          {oferta?.abierto && (
            <>
              <h2 className="seccion-titulo">Elige la hora</h2>
              <div className="horas">
                {horas.map((h) => (
                  <button key={h.hora} type="button" disabled={!h.libre} aria-pressed={hora === h.hora} className={cx('hora', hora === h.hora && 'hora--activa')} onClick={() => setHora(h.hora)}>{h.hora}</button>
                ))}
              </div>
              {horas.every((h) => !h.libre) && <p className="pantalla-nota">No quedan horarios este día.</p>}
              <p className="pantalla-nota">Las horas se calculan para un servicio de {oferta.duracionMin} min.</p>
            </>
          )}
          <Button className="btn--block" disabled={!fecha || !hora} onClick={() => setPaso(1)}>Continuar</Button>
        </>
      )}

      {paso === 1 && (
        <>
          {servicios.length > 0 && (
            <>
              <h2 className="seccion-titulo">Servicio</h2>
              <div className="opciones-radio" role="radiogroup">
                {servicios.map((s) => (
                  <button key={s.id} type="button" role="radio" aria-checked={servicioId === s.id} className={cx('opcion-radio', servicioId === s.id && 'opcion-radio--activa')} onClick={() => setServicioId(s.id)}>
                    <span><strong>{s.nombre}</strong><small>{pesos(s.precio)} · {s.duracionMin} min</small></span><span className="opcion-radio__punto" />
                  </button>
                ))}
              </div>
            </>
          )}
          <h2 className="seccion-titulo">¿Cuántas personas?</h2>
          <div className="contador">
            <button type="button" aria-label="Menos personas" disabled={personas <= 1} onClick={() => setPersonas(personas - 1)}>−</button>
            <strong aria-live="polite">{personas}</strong>
            <button type="button" aria-label="Más personas" disabled={personas >= 20} onClick={() => setPersonas(personas + 1)}>+</button>
          </div>
          <label className="campo-etiqueta">Notas para el negocio (opcional)
            <textarea value={notas} maxLength={300} onChange={(e) => setNotas(e.target.value)} placeholder="Alergias, ocasión especial…" />
          </label>
          <Button className="btn--block" disabled={servicios.length > 0 && !servicioId} onClick={() => setPaso(2)}>Continuar</Button>
        </>
      )}

      {paso === 2 && (
        <>
          <h2 className="seccion-titulo">Resumen</h2>
          <div className="grupo">
            <Fila t="Negocio" v={negocio.nombre} />
            {servicio && <Fila t="Servicio" v={`${servicio.nombre} · ${pesos(servicio.precio)}`} />}
            <Fila t="Fecha" v={fechaLarga(fecha)} />
            <Fila t="Hora" v={`${hora} h`} />
            <Fila t="Personas" v={String(personas)} />
            {notas && <Fila t="Notas" v={notas} />}
          </div>
          <Button className="btn--block" onClick={() => setPaso(3)}>Continuar</Button>
        </>
      )}

      {paso === 3 && (
        <>
          <h2 className="seccion-titulo">¿Cómo vas a pagar?</h2>
          <p className="nota-gris">Divika no cobra ni procesa pagos: pagas directamente al negocio.</p>
          {pagos.length > 0 ? (
            <div className="opciones-radio" role="radiogroup">
              {pagos.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={metodo === m} className={cx('opcion-radio', metodo === m && 'opcion-radio--activa')} onClick={() => setMetodo(m)}>
                  <span><strong>{NOMBRE_PAGO[m] ?? m}</strong></span><span className="opcion-radio__punto" />
                </button>
              ))}
            </div>
          ) : (
            <p className="pantalla-nota">Este negocio aún no indicó sus formas de pago; lo acuerdas con él.</p>
          )}
          <Button className="btn--block" disabled={enviando || (pagos.length > 0 && !metodo)} onClick={confirmar}>{enviando ? 'Enviando…' : 'Enviar solicitud'}</Button>
        </>
      )}

      {paso === 4 && cita && (
        <>
          <div className="eliminar">
            <span className="eliminar__sello" style={{ background: 'var(--color-categorias)', color: 'var(--color-primario)' }}><IconCheck /></span>
            <h2>¡Solicitud enviada!</h2>
            <p>{negocio.nombre} · {fechaLarga(cita.fecha)} · {cita.hora} h</p>
            <p>El negocio la revisará y la confirmará o te propondrá otro horario. Lo verás en Reservaciones.</p>
          </div>
          <Button className="btn--block" onClick={() => router.push('/reservaciones')}>Ver mis reservaciones</Button>
          <Link href="/home" className="enlace-boton texto-centrado">Volver al inicio</Link>
        </>
      )}
    </div>
  );
}

const Fila = ({ t, v }: { t: string; v: string }) => (
  <div className="ajuste"><span className="ajuste__texto"><small>{t}</small><strong>{v}</strong></span></div>
);

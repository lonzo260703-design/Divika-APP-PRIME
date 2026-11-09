'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Button } from '@/components/ui/Button';
import { IconBack, IconCard, IconCheck } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { cx } from '@/lib/cx';
import { diasDisponibles, fechaLarga, guardarReserva, horasDelDia, type ReservaDemo } from '@/lib/reservas';
import type { NegocioDetalle } from '@/types';

const PASOS = ['Fecha', 'Personas', 'Resumen', 'Pago', 'Listo'];

export default function ReservarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [negocio, setNegocio] = useState<NegocioDetalle | null>(null);
  const [paso, setPaso] = useState(0);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [personas, setPersonas] = useState(2);
  const [notas, setNotas] = useState('');
  const [metodo, setMetodo] = useState<'tarjeta' | 'negocio'>('negocio');
  const [reserva, setReserva] = useState<ReservaDemo | null>(null);

  useEffect(() => { api<NegocioDetalle>(`/negocios/${id}`).then(setNegocio).catch(() => router.replace('/home')); }, [id, router]);

  const dias = useMemo(() => diasDisponibles(negocio?.horariosJson ?? null), [negocio]);
  if (!negocio) return null;
  const dia = dias.find((d) => d.fecha === fecha);
  const horas = dia?.horario ? horasDelDia(dia.horario, fecha) : [];

  function confirmar() {
    if (!negocio) return;
    setReserva(guardarReserva({ negocioId: negocio.id, negocio: negocio.nombre, imagenUrl: negocio.imagenUrl, fecha, hora, personas, metodo, notas }));
    setPaso(4);
  }
  const atras = () => (paso === 0 ? router.push(`/negocio/${id}`) : setPaso(paso - 1));

  return (
    <div className="reservar">
      <div className="cabecera">
        <button type="button" className="atras" onClick={atras} aria-label="Volver" style={{ visibility: paso === 4 ? 'hidden' : 'visible' }}><IconBack /></button>
        <h1 className="titulo">Reservar</h1>
      </div>
      <p className="nota-gris">Demo: la reservación se guarda solo en este navegador. Aún no se envía al negocio.</p>
      <ol className="pasos" aria-label="Progreso">
        {PASOS.map((p, i) => <li key={p} className={cx(i === paso && 'pasos--actual', i < paso && 'pasos--hecho')}>{p}</li>)}
      </ol>

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
          {dia?.horario && (
            <>
              <h2 className="seccion-titulo">Elige la hora</h2>
              <div className="horas">
                {horas.map((h) => (
                  <button key={h.hora} type="button" disabled={!h.libre} aria-pressed={hora === h.hora} className={cx('hora', hora === h.hora && 'hora--activa')} onClick={() => setHora(h.hora)}>{h.hora}</button>
                ))}
              </div>
              {horas.every((h) => !h.libre) && <p className="pantalla-nota">No quedan horarios este día.</p>}
            </>
          )}
          <Button className="btn--block" disabled={!fecha || !hora} onClick={() => setPaso(1)}>Continuar</Button>
        </>
      )}

      {paso === 1 && (
        <>
          <h2 className="seccion-titulo">¿Cuántas personas?</h2>
          <div className="contador">
            <button type="button" aria-label="Menos personas" disabled={personas <= 1} onClick={() => setPersonas(personas - 1)}>−</button>
            <strong aria-live="polite">{personas}</strong>
            <button type="button" aria-label="Más personas" disabled={personas >= 10} onClick={() => setPersonas(personas + 1)}>+</button>
          </div>
          <label className="campo-etiqueta">Notas para el negocio (opcional)
            <textarea value={notas} maxLength={300} onChange={(e) => setNotas(e.target.value)} placeholder="Alergias, ocasión especial…" />
          </label>
          <Button className="btn--block" onClick={() => setPaso(2)}>Continuar</Button>
        </>
      )}

      {paso === 2 && (
        <>
          <h2 className="seccion-titulo">Resumen</h2>
          <div className="grupo">
            <Fila t="Negocio" v={negocio.nombre} />
            <Fila t="Fecha" v={fechaLarga(fecha)} />
            <Fila t="Hora" v={`${hora} h`} />
            <Fila t="Personas" v={String(personas)} />
            {notas && <Fila t="Notas" v={notas} />}
          </div>
          <Button className="btn--block" onClick={() => setPaso(3)}>Continuar al pago</Button>
        </>
      )}

      {paso === 3 && (
        <>
          <h2 className="seccion-titulo">Método de pago</h2>
          <p className="nota-gris">Demo: no se cobra nada ni se piden datos de tarjeta.</p>
          <div className="opciones-radio" role="radiogroup">
            <button type="button" role="radio" aria-checked={metodo === 'tarjeta'} className={cx('opcion-radio', metodo === 'tarjeta' && 'opcion-radio--activa')} onClick={() => setMetodo('tarjeta')}>
              <span><strong><IconCard /> Tarjeta VISA ···· 4242</strong><small>Tarjeta de ejemplo</small></span><span className="opcion-radio__punto" />
            </button>
            <button type="button" role="radio" aria-checked={metodo === 'negocio'} className={cx('opcion-radio', metodo === 'negocio' && 'opcion-radio--activa')} onClick={() => setMetodo('negocio')}>
              <span><strong>Pago en el negocio</strong><small>Pagas al llegar</small></span><span className="opcion-radio__punto" />
            </button>
          </div>
          <Button className="btn--block" onClick={confirmar}>Confirmar reservación</Button>
        </>
      )}

      {paso === 4 && reserva && (
        <>
          <div className="eliminar">
            <span className="eliminar__sello" style={{ background: 'var(--color-categorias)', color: 'var(--color-primario)' }}><IconCheck /></span>
            <h2>¡Reservación de ejemplo lista!</h2>
            <p>{negocio.nombre} · {fechaLarga(reserva.fecha)} · {reserva.hora} h · {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'}</p>
            <p>Folio {reserva.id}</p>
          </div>
          <p className="nota-gris">Esto es una demostración: el negocio no recibió tu reservación.</p>
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

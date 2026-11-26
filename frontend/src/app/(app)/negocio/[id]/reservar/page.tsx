'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconCheck } from '@/components/ui/icons';
import { CalendarioMes, diaLargo, fechaCortaAnio } from '@/components/web/ReservaLinea';
import { useCategoriaActiva } from '@/components/web/MarcoWeb';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import { cx } from '@/lib/cx';
import { NOMBRE_PAGO, pesos } from '@/lib/reservas';
import { textosCategoria } from '@/lib/textosCategoria';
import type { Cita, NegocioDetalle, OfertaDia, Servicio } from '@/types';

// "Web · Reserva": asistente paso a paso (diseño de Figma). Divika no cobra, así que no hay paso de pago:
// la forma de pago preferida se indica y se acuerda con el negocio.
const PASOS = ['Fecha y hora', 'Personas', 'Resumen', 'Confirmación'];
const TITULOS = ['Elige fecha y hora', '¿Cuántas personas?', 'Revisa tu solicitud', 'Solicitud enviada'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// "14 de noviembre de 2026"
const fechaCompleta = (f: string) => { const d = new Date(`${f}T00:00`); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
// "14 nov"
const fechaCorta = (f: string) => fechaCortaAnio(f).split(' ').slice(0, 2).join(' ');

export default function ReservarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { categorias } = useCategorias();
  const marcarCategoria = useCategoriaActiva();
  const [negocio, setNegocio] = useState<NegocioDetalle | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [paso, setPaso] = useState(0);
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [lugar, setLugar] = useState<'local' | 'domicilio'>('local');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [oferta, setOferta] = useState<OfertaDia | null>(null);
  const [personas, setPersonas] = useState(1);
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [metodo, setMetodo] = useState('');
  const [cita, setCita] = useState<Cita | null>(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api<NegocioDetalle>(`/negocios/${id}`).then(setNegocio).catch(() => router.replace('/home'));
    api<Servicio[]>(`/negocios/${id}/servicios`).then((l) => { setServicios(l); if (l.length === 1) setServicioId(l[0].id); }).catch(() => setServicios([]));
  }, [id, router]);
  useEffect(() => { marcarCategoria(negocio?.categoria ?? null); return () => marcarCategoria(null); }, [negocio?.categoria, marcarCategoria]);

  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  useEffect(() => { if (servicio) setLugar(servicio.modalidad === 'domicilio' ? 'domicilio' : 'local'); }, [servicio]);

  useEffect(() => {
    if (!fecha) return;
    setOferta(null); setHora('');
    api<OfertaDia>(`/negocios/${id}/disponibilidad?fecha=${fecha}${servicioId ? `&servicioId=${servicioId}` : ''}`).then(setOferta).catch(() => {});
  }, [id, fecha, servicioId]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [paso]);

  if (!negocio) return null;

  const t = textosCategoria(negocio.categoria);
  const categoria = categorias.find((c) => c.slug === negocio.categoria);
  const aDomicilio = !!servicio && (servicio.modalidad === 'domicilio' || (servicio.modalidad === 'ambos' && lugar === 'domicilio'));
  const traslado = aDomicilio ? servicio?.costoTraslado ?? 0 : 0;
  const pagos = negocio.metodosPago ?? [];
  const listoPaso1 = (servicios.length === 0 || !!servicio) && !!fecha && !!hora;
  const listoPaso2 = !aDomicilio || !!direccion.trim();

  async function enviar() {
    setError(''); setEnviando(true);
    try {
      const texto = [aDomicilio ? `Servicio a domicilio. Dirección: ${direccion.trim()}` : '', notas.trim()].filter(Boolean).join('\n');
      setCita(await api<Cita>('/citas', { method: 'POST', body: { negocioId: negocio!.id, servicioId: servicioId ?? undefined, fecha, hora, personas, notas: texto || undefined, metodoPago: metodo || undefined } }));
      setPaso(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud');
    } finally { setEnviando(false); }
  }

  return (
    <div className="wa-ancho rsv">
      <nav className="rsv-migas" aria-label="Ruta">
        <Link href="/home">Inicio</Link><span>/</span>
        <Link href={`/negocio/${negocio.id}`}>{negocio.nombre}</Link><span>/</span><span>Reservación</span>
      </nav>
      <h1 className="rsv-titulo">{TITULOS[paso]}</h1>

      <ol className="rsv-pasos" aria-label="Pasos">
        {PASOS.map((p, i) => (
          <li key={p} className={cx(i === paso && 'rsv-pasos--actual', i < paso && 'rsv-pasos--hecho')} aria-current={i === paso ? 'step' : undefined}>
            {i + 1} · {p}
          </li>
        ))}
      </ol>

      <div className="rsv-cuerpo">
        <div className="rsv-col">
          <section className="rsv-panel">
            {paso === 0 && (
              <>
                {(servicios.length > 0 || (servicio && servicio.modalidad !== 'local')) && (
                  <div className="rsv-servicio">
                    {servicios.length > 0 && (
                      <label className="wa-campo">Servicio
                        <select value={servicioId ?? ''} onChange={(e) => setServicioId(e.target.value || null)}>
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
                      </div>
                    )}
                  </div>
                )}

                <CalendarioMes grande negocio={negocio} fecha={fecha} onFecha={setFecha} />

                <div className="rsv-horas">
                  <h2>Hora disponible{fecha ? ` · ${diaLargo(fecha)}` : ''}</h2>
                  {!fecha && <p className="rsv-nota">Primero elige un día en el calendario.</p>}
                  {fecha && !oferta && <p className="rsv-nota">Buscando horarios…</p>}
                  {oferta && !oferta.abierto && <p className="rsv-nota">{oferta.motivo ?? 'Sin disponibilidad ese día.'}</p>}
                  {oferta?.abierto && (
                    <>
                      <div className="rsv-horas__grid">
                        {oferta.horas.map((h) => (
                          <button key={h.hora} type="button" disabled={!h.libre} aria-pressed={hora === h.hora} className={cx(hora === h.hora && 'activa')} onClick={() => setHora(h.hora)}>
                            {h.hora}{hora === h.hora && <IconCheck />}
                          </button>
                        ))}
                      </div>
                      {oferta.horas.every((h) => !h.libre) && <p className="rsv-nota">No quedan horarios este día.</p>}
                    </>
                  )}
                  {fecha && hora && <p className="rsv-nota">Fecha seleccionada: {fechaCorta(fecha)} · {hora} h · Hora local del negocio.</p>}
                </div>
              </>
            )}

            {paso === 1 && (
              <>
                <p className="rsv-sub">Así el negocio puede prepararse para recibirte.</p>
                <div className="rsv-contador" role="group" aria-label="Personas">
                  <button type="button" aria-label="Una persona menos" disabled={personas <= 1} onClick={() => setPersonas((n) => n - 1)}>−</button>
                  <strong>{personas} {personas === 1 ? 'persona' : 'personas'}</strong>
                  <button type="button" aria-label="Una persona más" disabled={personas >= 20} onClick={() => setPersonas((n) => n + 1)}>+</button>
                </div>
                {aDomicilio && <label className="wa-campo">Tu dirección<input value={direccion} maxLength={200} placeholder="Calle, número y colonia" onChange={(e) => setDireccion(e.target.value)} /></label>}
                <label className="wa-campo">Notas para el negocio (opcional)
                  <textarea rows={3} maxLength={300} value={notas} placeholder="Ej. una ocasión especial o algo que deban saber" onChange={(e) => setNotas(e.target.value)} />
                </label>
                {pagos.length > 0 && (
                  <label className="wa-campo">Forma de pago preferida (opcional)
                    <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                      <option value="">Lo acuerdo con el negocio</option>
                      {pagos.map((m) => <option key={m} value={m}>{NOMBRE_PAGO[m] ?? m}</option>)}
                    </select>
                  </label>
                )}
                {servicio?.indicaciones && <p className="rsv-nota">{servicio.indicaciones}</p>}
              </>
            )}

            {paso === 2 && (
              <>
                <p className="rsv-sub">Confirma los datos antes de enviarla al negocio.</p>
                <dl className="rsv-datos">
                  <div><dt>Negocio</dt><dd>{negocio.nombre}</dd></div>
                  {servicio && <div><dt>Servicio</dt><dd>{servicio.nombre}</dd></div>}
                  <div><dt>Fecha y hora</dt><dd>{fechaCompleta(fecha)} · {hora} h</dd></div>
                  <div><dt>Personas</dt><dd>{personas}</dd></div>
                  <div><dt>Lugar</dt><dd>{aDomicilio ? `A domicilio: ${direccion.trim()}` : negocio.direccion}</dd></div>
                  {notas.trim() && <div><dt>Notas</dt><dd>{notas.trim()}</dd></div>}
                  <div><dt>Pago</dt><dd>{metodo ? `${NOMBRE_PAGO[metodo] ?? metodo}, directamente con el negocio` : 'Se acuerda con el negocio'}</dd></div>
                </dl>
                <p className="rsv-nota">Divika no cobra ni guarda datos de tarjetas. Aún no es una reserva confirmada: el negocio la revisará.</p>
                {error && <p className="form__error">{error}</p>}
              </>
            )}

            {paso === 3 && cita && (
              <div className="rsv-ok">
                <span className="wa-reserva__check"><IconCheck /></span>
                <h2>¡Listo!</h2>
                <p>{fechaCompleta(cita.fecha)} · {cita.hora} h{servicio ? ` · ${servicio.nombre}` : ''}</p>
                <p className="rsv-nota">{negocio.nombre} revisará tu solicitud y te responderá. Te avisaremos en tus notificaciones.</p>
              </div>
            )}
          </section>

          <div className="rsv-botones">
            {paso === 0 && <Link href={`/negocio/${negocio.id}`} className="rsv-btn-borde"><span aria-hidden>←</span> Volver</Link>}
            {paso === 1 || paso === 2 ? <button type="button" className="rsv-btn-borde" onClick={() => setPaso(paso - 1)}><span aria-hidden>←</span> Volver</button> : null}
            {paso < 2 && <button type="button" className="rsv-btn" disabled={paso === 0 ? !listoPaso1 : !listoPaso2} onClick={() => setPaso(paso + 1)}>Continuar <span aria-hidden>→</span></button>}
            {paso === 2 && <button type="button" className="rsv-btn" disabled={enviando} onClick={enviar}>{enviando ? 'Enviando…' : <>{t.boton} <span aria-hidden>→</span></>}</button>}
            {paso === 3 && (
              <>
                <Link href={`/negocio/${negocio.id}`} className="rsv-btn-borde"><span aria-hidden>←</span> Volver al negocio</Link>
                <Link href="/reservaciones" className="rsv-btn">Ver mis reservas <span aria-hidden>→</span></Link>
              </>
            )}
          </div>
        </div>

        <aside className="rsv-lado" aria-label="Tu reserva">
          {negocio.imagenUrl ? <img className="rsv-lado__foto" src={negocio.imagenUrl} alt="" /> : <div className="rsv-lado__foto rsv-lado__foto--vacia" aria-hidden>{negocio.nombre.charAt(0)}</div>}
          <h2>{negocio.nombre}</h2>
          <p className="rsv-lado__gris">{[categoria?.nombre ?? negocio.categoria, negocio.subcategoria].filter(Boolean).join(' · ')}</p>
          <p className="rsv-lado__gris">★ {negocio.calificacion.toFixed(1)}{negocio.ciudad ? ` · ${negocio.ciudad}` : ''}</p>
          <p className="rsv-lado__cuando">
            {fecha ? fechaCompleta(fecha) : 'Elige una fecha'}<br />
            {hora ? `${hora} h · ` : ''}{personas} {personas === 1 ? 'persona' : 'personas'}{aDomicilio ? ' · A domicilio' : ''}
          </p>
          <div className="rsv-lado__precios">
            {servicio ? <div><span>{servicio.nombre}</span><span>{pesos(servicio.precio)}</span></div> : <div><span>Precio</span><span>Lo indica el negocio</span></div>}
            {traslado > 0 && <div><span>Traslado</span><span>{pesos(traslado)}</span></div>}
          </div>
          <p className="rsv-lado__etiqueta">Total estimado</p>
          <strong className="rsv-lado__total">{servicio && servicio.precio != null ? `${pesos(servicio.precio + traslado)} MXN` : 'A consultar'}</strong>
          <p className="rsv-lado__aviso">Divika no cobra · Se paga en el negocio</p>
        </aside>
      </div>
    </div>
  );
}

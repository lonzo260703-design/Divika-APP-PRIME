import { Negocio } from '../negocios/negocio.entity';

export const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
export const REGLAS_INICIALES = { duracionBase: 60, intervaloMin: 60, anticipacionHoras: 2, maxDias: 60 };
export const HORARIO_INICIAL = { apertura: '09:00', cierre: '18:00', cerrado: false };

const ZONA = process.env.TZ_NEGOCIOS || 'America/Mexico_City';

// Fecha y hora actuales en la zona de los negocios (el servidor puede estar en otra zona).
// "ms" es una marca comparable con enMs(): no es un instante UTC real.
export function ahoraLocal() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  const h = Number(p.hour) % 24;
  return { fecha: `${p.year}-${p.month}-${p.day}`, ms: Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), h, Number(p.minute)) };
}

export const aMin = (h: string) => {
  const [a, b] = h.split(':').map(Number);
  return a * 60 + b;
};
export const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const enMs = (fecha: string, min: number) => {
  const [y, m, d] = fecha.split('-').map(Number);
  return Date.UTC(y, m - 1, d, 0, min);
};
export const diaSemana = (fecha: string) => DIAS[new Date(`${fecha}T12:00:00Z`).getUTCDay()];
export const sumarDias = (fecha: string, n: number) => {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const reglasDe = (n: Negocio) => ({ ...REGLAS_INICIALES, ...(n.disponibilidad ?? {}) });

// Horas que se ofrecen en una fecha. "ocupadas" son las citas confirmadas (inicio y duración en minutos).
export function horasDelDia(n: Negocio, fecha: string, duracion: number, ocupadas: { hora: string; dur: number }[]) {
  const r = reglasDe(n);
  const ahora = ahoraLocal();
  if (fecha < ahora.fecha) return { abierto: false, motivo: 'Esa fecha ya pasó', horas: [] as { hora: string; libre: boolean }[] };
  if (fecha > sumarDias(ahora.fecha, r.maxDias)) return { abierto: false, motivo: `Solo se reserva con ${r.maxDias} días de anticipación`, horas: [] };
  const bloqueo = (n.bloqueos ?? []).find((b) => fecha >= b.desde && fecha <= b.hasta);
  if (bloqueo) return { abierto: false, motivo: bloqueo.motivo || 'El negocio no atiende ese día', horas: [] };
  const h = n.horariosJson ? n.horariosJson[diaSemana(fecha)] : HORARIO_INICIAL;
  if (!h || h.cerrado) return { abierto: false, motivo: 'El negocio no abre ese día', horas: [] };

  const horas: { hora: string; libre: boolean }[] = [];
  const cierre = aMin(h.cierre);
  for (let m = aMin(h.apertura); m + duracion <= cierre; m += r.intervaloMin) {
    const aTiempo = enMs(fecha, m) >= ahora.ms + r.anticipacionHoras * 3600000;
    const choca = ocupadas.some((o) => m < aMin(o.hora) + o.dur && aMin(o.hora) < m + duracion);
    horas.push({ hora: aHora(m), libre: aTiempo && !choca });
  }
  return { abierto: true, horas };
}

import type { HorarioDia } from '@/types';

const DIAS: [string, string][] = [
  ['lunes', 'Lunes'], ['martes', 'Martes'], ['miercoles', 'Miércoles'],
  ['jueves', 'Jueves'], ['viernes', 'Viernes'], ['sabado', 'Sábado'], ['domingo', 'Domingo'],
];

const hora = (h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  const sufijo = hh >= 12 ? 'pm' : 'am';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return mm ? `${h12}:${String(mm).padStart(2, '0')} ${sufijo}` : `${h12} ${sufijo}`;
};

// Agrupa días seguidos con el mismo horario: "Lunes a viernes · 9 am – 7 pm"
export function resumenHorario(horarios: Record<string, HorarioDia> | null): string[] {
  if (!horarios) return [];
  const grupos: { dias: string[]; texto: string }[] = [];
  for (const [clave, nombre] of DIAS) {
    const d = horarios[clave];
    if (!d) continue;
    const texto = d.cerrado ? 'Cerrado' : `${hora(d.apertura)} – ${hora(d.cierre)}`;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.texto === texto) ultimo.dias.push(nombre);
    else grupos.push({ dias: [nombre], texto });
  }
  return grupos.map((g) => {
    const dias = g.dias.length === 1 ? g.dias[0] : g.dias.length === 2 ? `${g.dias[0]} y ${g.dias[1].toLowerCase()}` : `${g.dias[0]} a ${g.dias[g.dias.length - 1].toLowerCase()}`;
    return `${dias} · ${g.texto}`;
  });
}

// ¿Está abierto en este momento? (null si el negocio no capturó horario)
export function abiertoAhora(horarios: Record<string, HorarioDia> | null, ahora = new Date()): boolean | null {
  if (!horarios) return null;
  const clave = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][ahora.getDay()];
  const d = horarios[clave];
  if (!d) return null;
  if (d.cerrado) return false;
  const min = ahora.getHours() * 60 + ahora.getMinutes();
  const aMin = (h: string) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
  return min >= aMin(d.apertura) && min < aMin(d.cierre);
}

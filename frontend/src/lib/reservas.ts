import type { HorarioDia } from '@/types';

// DEMO: las reservaciones se guardan solo en este navegador (no hay backend de reservas todavía).
export type ReservaDemo = {
  id: string;
  negocioId: number;
  negocio: string;
  imagenUrl: string | null;
  fecha: string; // AAAA-MM-DD
  hora: string; // HH:MM
  personas: number;
  metodo: 'tarjeta' | 'negocio';
  notas: string;
  estado: 'confirmada' | 'cancelada';
};

const CLAVE = 'divika-reservas-demo';

export function leerReservas(): ReservaDemo[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
  } catch {
    return [];
  }
}
function escribir(l: ReservaDemo[]) {
  try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch {}
}
export function guardarReserva(r: Omit<ReservaDemo, 'id' | 'estado'>) {
  const nueva: ReservaDemo = { ...r, id: `R${Date.now().toString(36).toUpperCase()}`, estado: 'confirmada' };
  escribir([nueva, ...leerReservas()]);
  return nueva;
}
export function cancelarReserva(id: string) {
  escribir(leerReservas().map((r) => (r.id === id ? { ...r, estado: 'cancelada' } : r)));
}

const CLAVES_DIA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fechaLarga = (f: string) =>
  new Date(`${f}T12:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

// Próximos 14 días con su horario (sin horario capturado: 9:00 a 18:00 todos los días)
export function diasDisponibles(horarios: Record<string, HorarioDia> | null) {
  const hoy = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    const h = horarios ? horarios[CLAVES_DIA[d.getDay()]] : { apertura: '09:00', cierre: '18:00', cerrado: false };
    return { fecha: iso(d), date: d, horario: h && !h.cerrado ? h : null };
  });
}

// Horas de ejemplo cada 60 min; algunas salen "ocupadas" de forma fija para que se vea cómo funciona
export function horasDelDia(h: HorarioDia, fecha: string) {
  const [a] = h.apertura.split(':').map(Number);
  const [c] = h.cierre.split(':').map(Number);
  const ahora = new Date();
  const esHoy = fecha === iso(ahora);
  const dia = Number(fecha.slice(-2));
  const horas: { hora: string; libre: boolean }[] = [];
  for (let x = a; x < c; x++) {
    const pasada = esHoy && x <= ahora.getHours();
    horas.push({ hora: `${String(x).padStart(2, '0')}:00`, libre: !pasada && (x + dia) % 4 !== 0 });
  }
  return horas;
}

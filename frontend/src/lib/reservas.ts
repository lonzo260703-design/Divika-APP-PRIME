import type { Cita, EstadoCita, HorarioDia } from '@/types';

const CLAVES_DIA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fechaLarga = (f: string) =>
  new Date(`${f}T12:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
export const fechaCorta = (f: string) =>
  new Date(`${f}T12:00:00`).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });

export const ESTADO_CITA: Record<EstadoCita, string> = {
  solicitada: 'Pendiente',
  confirmada: 'Confirmada',
  propuesta: 'Nuevo horario propuesto',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

// ¿La cita sigue vigente (todavía puede ocurrir)?
export const vigente = (c: Cita) => ['solicitada', 'confirmada', 'propuesta'].includes(c.estado) && `${c.fecha}T${c.hora}` >= iso(new Date());

// Próximos 14 días con su horario (sin horario capturado: 9:00 a 18:00 todos los días)
export function diasDisponibles(horarios: Record<string, HorarioDia> | null) {
  const hoy = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    const h = horarios ? horarios[CLAVES_DIA[d.getDay()]] : { apertura: '09:00', cierre: '18:00', cerrado: false };
    return { fecha: iso(d), date: d, horario: h && !h.cerrado ? h : null };
  });
}

// Horas cada 60 min dentro del horario; "ocupadas" son las que el negocio ya confirmó a otra persona
export function horasDelDia(h: HorarioDia, fecha: string, ocupadas: string[]) {
  const [a] = h.apertura.split(':').map(Number);
  const [c] = h.cierre.split(':').map(Number);
  const ahora = new Date();
  const esHoy = fecha === iso(ahora);
  const horas: { hora: string; libre: boolean }[] = [];
  for (let x = a; x < c; x++) {
    const hora = `${String(x).padStart(2, '0')}:00`;
    horas.push({ hora, libre: !(esHoy && x <= ahora.getHours()) && !ocupadas.includes(hora) });
  }
  return horas;
}

export const pesos = (n: number | null) => (n == null ? 'A consultar' : n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }));
export const NOMBRE_PAGO: Record<string, string> = { efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta' };

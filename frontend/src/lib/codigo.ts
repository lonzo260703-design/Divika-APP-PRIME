import { api } from './api';

export type Canal = 'sms' | 'email';
export type CodigoPendiente = { canal: Canal; destino: string; proximoEnvio: number };

const CLAVE = 'divika-codigo';

// Guardamos a quién se le pidió el código solo mientras dura la pestaña (no queda en la URL)
export function guardarPendiente(p: CodigoPendiente) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(p));
  } catch {}
}

export function leerPendiente(): CodigoPendiente | null {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null');
  } catch {
    return null;
  }
}

export function borrarPendiente() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {}
}

// Pide el código al backend y deja anotado cuándo se puede pedir otro
export async function pedirCodigo(canal: Canal, destino: string) {
  const { segundosEspera } = await api<{ enviado: boolean; segundosEspera: number }>('/auth/codigo/enviar', {
    method: 'POST',
    body: { canal, destino },
  });
  const pendiente = { canal, destino, proximoEnvio: Date.now() + segundosEspera * 1000 };
  guardarPendiente(pendiente);
  return pendiente;
}

// Deja solo los dígitos (acepta "618 123 4567", "+52 618…")
export const soloDigitos = (t: string) => t.replace(/\D/g, '');

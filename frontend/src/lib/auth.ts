import { api } from './api';
import type { Sesion, Usuario } from '@/types';

const CLAVE = 'divika-sesion';

export function getSesion(): Sesion | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? 'null');
  } catch {
    return null;
  }
}

export const getToken = () => getSesion()?.token ?? null;
export const getUsuario = (): Usuario | null => getSesion()?.usuario ?? null;

export function cerrarSesion() {
  localStorage.removeItem(CLAVE);
}

// Llama al backend (login o registro) y guarda la sesión que devuelve
export async function entrar(ruta: string, body: unknown) {
  const sesion = await api<Sesion>(ruta, { method: 'POST', body });
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
  return sesion;
}

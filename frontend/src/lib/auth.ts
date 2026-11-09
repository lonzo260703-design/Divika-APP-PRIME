import { api } from './api';
import type { Sesion, Usuario } from '@/types';

const CLAVE = 'divika-sesion';
export const CLAVE_CUENTAS = 'divika-cuentas';

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

export function guardarSesion(sesion: Sesion) {
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
}

// Al editar el perfil, deja la sesión guardada al día (nombre, correo, foto…)
export function actualizarUsuario(cambios: Partial<Usuario>) {
  const s = getSesion();
  if (s) guardarSesion({ ...s, usuario: { ...s.usuario, ...cambios } });
}

// Cerrar sesión también olvida las demás cuentas agregadas en este dispositivo
export function cerrarSesion() {
  localStorage.removeItem(CLAVE);
  localStorage.removeItem(CLAVE_CUENTAS);
}

// Llama al backend (login o registro) y guarda la sesión que devuelve
export async function entrar(ruta: string, body: unknown) {
  const sesion = await api<Sesion>(ruta, { method: 'POST', body });
  guardarSesion(sesion);
  return sesion;
}

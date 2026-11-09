import { CLAVE_CUENTAS, getSesion, guardarSesion } from './auth';
import type { Sesion } from '@/types';

// Cuentas agregadas en este dispositivo ("Agregar cuenta"), para cambiar entre ellas sin volver a escribir la contraseña.
// Se guardan junto con su token en el navegador y se borran al cerrar sesión.
function leer(): Sesion[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CUENTAS) ?? '[]');
  } catch {
    return [];
  }
}

export function recordarCuenta(sesion: Sesion | null) {
  if (!sesion) return;
  const otras = leer().filter((s) => s.usuario.id !== sesion.usuario.id);
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify([sesion, ...otras]));
}

export function listarCuentas(): Sesion[] {
  const actual = getSesion();
  const otras = leer().filter((s) => s.usuario.id !== actual?.usuario.id);
  return actual ? [actual, ...otras] : otras;
}

export function cambiarACuenta(id: number) {
  const s = leer().find((c) => c.usuario.id === id);
  if (!s) return false;
  recordarCuenta(getSesion());
  guardarSesion(s);
  return true;
}

export function olvidarCuenta(id: number) {
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(leer().filter((s) => s.usuario.id !== id)));
}

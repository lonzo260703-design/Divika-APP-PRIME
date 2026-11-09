import { cerrarSesion, getToken } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Opciones = { method?: string; body?: unknown };

// Un solo lugar para hablar con el backend de NestJS
export async function api<T>(ruta: string, { method = 'GET', body }: Opciones = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    // FormData (subir fotos): el navegador pone solo el Content-Type con su separador
    const esArchivo = body instanceof FormData;
    res = await fetch(`${API}${ruta}`, {
      method,
      headers: {
        ...(esArchivo ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (esArchivo ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }
  if (!res.ok) {
    // Token vencido o usuario que ya no existe (p. ej. se reinició la base de datos): se limpia la sesión
    if (res.status === 401 && token && typeof window !== 'undefined' && !ruta.startsWith('/auth/')) {
      cerrarSesion();
      window.location.href = window.location.pathname.startsWith('/portal') ? '/login/proveedores' : '/login';
    }
    const error = await res.json().catch(() => null);
    const mensaje = Array.isArray(error?.message) ? error.message.join('. ') : error?.message;
    throw new Error(mensaje ?? 'Algo salió mal');
  }
  return res.json();
}

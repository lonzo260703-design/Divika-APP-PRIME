'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Atras } from '../layout/Atras';
import { Logo } from '../layout/Logo';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { cerrarSesion, entrar } from '@/lib/auth';
import { useFormulario } from './useFormulario';

// Acceso de proveedores en celular (correo y contraseña)
export function LoginProveedorMovil() {
  const router = useRouter();
  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    const sesion = await entrar('/auth/login', datos);
    if (sesion.usuario.rol !== 'negocio') {
      cerrarSesion();
      throw new Error('Esta cuenta no es de proveedor. Entra desde el acceso de usuarios.');
    }
    router.push('/portal');
  });

  return (
    <main className="screen screen--pagina">
      <Atras href="/acceso" />
      <Logo pequeno />
      <h1 className="titulo">Acceso para proveedores</h1>
      <form className="form" onSubmit={onSubmit}>
        <Field label="Correo electrónico" name="email" type="email" required autoComplete="email" />
        <Field label="Contraseña" name="password" type="password" required autoComplete="current-password" />
        {error && <p className="form__error">{error}</p>}
        <Button type="submit" className="btn--block" disabled={cargando}>{cargando ? 'Entrando…' : 'Iniciar sesión'}</Button>
      </form>
      <p className="texto-aparte">¿Aún no tienes cuenta? <Link href="/proveedores/registro">Registra tu negocio</Link></p>
    </main>
  );
}

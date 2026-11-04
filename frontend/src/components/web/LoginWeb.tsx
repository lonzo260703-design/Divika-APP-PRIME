'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconEye, IconEyeOff, IconGoogle } from '../ui/icons';
import { useFormulario } from '../forms/useFormulario';
import { cerrarSesion, entrar } from '@/lib/auth';

const Github = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
  </svg>
);
const Facebook = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877f2" aria-hidden>
    <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
  </svg>
);

// Pantalla de acceso de la versión web. "usuario" = clientes, "proveedor" = dueños de negocio.
export function LoginWeb({ tipo }: { tipo: 'usuario' | 'proveedor' }) {
  const router = useRouter();
  const proveedor = tipo === 'proveedor';
  const [ver, setVer] = useState(false);
  const [aviso, setAviso] = useState('');

  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    const sesion = await entrar('/auth/login', datos);
    if (proveedor && sesion.usuario.rol !== 'negocio') {
      cerrarSesion();
      throw new Error('Esta cuenta no es de proveedor. Entra desde el acceso de usuarios.');
    }
    router.push('/home');
  });

  const pronto = (red: string) => {
    setAviso(`Continuar con ${red} estará disponible pronto.`);
  };

  return (
    <div className="web-pagina web-login">
      <Link href="/" className="web-login__logo" aria-label="Divika, inicio"><img src="/logo.png" alt="Divika" /></Link>

      <section className="web-login__tarjeta">
        <h1>{proveedor ? 'Inicia sesión como proveedor' : 'Inicia sesión'}</h1>

        <form onSubmit={onSubmit} className="web-login__form">
          <label>
            Correo electrónico
            <input name="email" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com" />
          </label>
          <label>
            Contraseña
            <span className="web-login__pass">
              <input name="password" type={ver ? 'text' : 'password'} required autoComplete="current-password" placeholder="Tu contraseña" />
              <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {ver ? <IconEyeOff /> : <IconEye />}
              </button>
            </span>
          </label>
          <Link href="/acceso" className="web-login__olvide">¿Olvidaste tu contraseña? Entra con un código</Link>
          {error && <p className="form__error" role="alert">{error}</p>}
          <button type="submit" className="web-btn web-btn--carmesi web-btn--block" disabled={cargando}>
            {cargando ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="web-login__o">o continúa con</p>
        <div className="web-login__redes">
          <button type="button" onClick={() => pronto('Google')}><IconGoogle /></button>
          <button type="button" onClick={() => pronto('GitHub')} aria-label="GitHub"><Github /></button>
          <button type="button" onClick={() => pronto('Facebook')} aria-label="Facebook"><Facebook /></button>
        </div>
        {aviso && <p className="web-login__aviso" role="status">{aviso}</p>}

        <p className="web-login__pie">
          {proveedor ? (
            <>¿Aún no anuncias tu negocio? <Link href="/proveedores">Regístralo gratis</Link> · <Link href="/login">Acceso de usuarios</Link></>
          ) : (
            <>¿No tienes cuenta? <Link href="/registro">Regístrate</Link> · <Link href="/login/proveedores">Acceso para proveedores</Link></>
          )}
        </p>
      </section>
    </div>
  );
}

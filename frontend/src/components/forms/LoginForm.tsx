'use client';

import { useRouter } from 'next/navigation';
import { entrar } from '@/lib/auth';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { useFormulario } from './useFormulario';

export function LoginForm() {
  const router = useRouter();
  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    await entrar('/auth/login', datos);
    router.push('/home');
  });

  return (
    <form className="form" onSubmit={onSubmit}>
      <Field label="Correo electrónico" name="email" type="email" required autoComplete="email" />
      <Field label="Contraseña" name="password" type="password" required autoComplete="current-password" />
      {error && <p className="form__error">{error}</p>}
      <Button type="submit" className="btn--block" disabled={cargando}>
        {cargando ? 'Entrando…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}

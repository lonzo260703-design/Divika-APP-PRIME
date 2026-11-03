'use client';

import { useRouter } from 'next/navigation';
import { entrar } from '@/lib/auth';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { useFormulario } from './useFormulario';

export function RegistroClienteForm() {
  const router = useRouter();
  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    await entrar('/auth/registro/cliente', datos);
    router.push('/home');
  });

  return (
    <form className="form" onSubmit={onSubmit}>
      <Field label="Nombre completo" name="nombre" required autoComplete="name" />
      <Field label="Correo electrónico" name="email" type="email" required autoComplete="email" />
      <Field label="Contraseña (mínimo 8 caracteres)" name="password" type="password" minLength={8} required autoComplete="new-password" />
      {error && <p className="form__error">{error}</p>}
      <Button type="submit" disabled={cargando}>
        {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  );
}

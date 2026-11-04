'use client';

import { useRouter } from 'next/navigation';
import { entrar } from '@/lib/auth';
import { CATEGORIAS } from '@/lib/categorias';
import { Button } from '../ui/Button';
import { Field, SelectField } from '../ui/Field';
import { useFormulario } from './useFormulario';

export function RegistroNegocioForm() {
  const router = useRouter();
  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    await entrar('/auth/registro/negocio', datos);
    router.push('/home');
  });

  return (
    <form className="form" onSubmit={onSubmit}>
      <Field label="Nombre del local" name="nombreLocal" required />
      <SelectField label="Categoría / giro" name="categoria" required defaultValue="">
        <option value="" disabled>Elige una categoría</option>
        {CATEGORIAS.map((c) => (
          <option key={c.slug} value={c.slug}>{c.nombre}</option>
        ))}
      </SelectField>
      <Field label="Teléfono de contacto" name="telefono" type="tel" required autoComplete="tel" />
      <Field label="Dirección física" name="direccion" required autoComplete="street-address" />
      <Field label="Horario de atención (opcional)" name="horario" placeholder="Lun a Sáb, 9:00 a 18:00" />
      <Field label="Correo electrónico" name="email" type="email" required autoComplete="email" />
      <Field label="Contraseña (mínimo 8 caracteres)" name="password" type="password" minLength={8} required autoComplete="new-password" />
      {error && <p className="form__error">{error}</p>}
      <Button type="submit" className="btn--block" disabled={cargando}>
        {cargando ? 'Registrando…' : 'Registrar mi negocio'}
      </Button>
    </form>
  );
}

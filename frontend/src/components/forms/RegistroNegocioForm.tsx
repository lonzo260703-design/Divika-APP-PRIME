'use client';

import { useRouter } from 'next/navigation';
import { entrar } from '@/lib/auth';
import { useState } from 'react';
import { useCategorias } from '@/lib/categorias';
import { Button } from '../ui/Button';
import { Field, SelectField } from '../ui/Field';
import { useFormulario } from './useFormulario';

export function RegistroNegocioForm() {
  const router = useRouter();
  const { categorias } = useCategorias();
  const [categoria, setCategoria] = useState('');
  const subcategorias = categorias.find((c) => c.slug === categoria)?.subcategorias ?? [];
  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    await entrar('/auth/registro/negocio', datos);
    router.push('/home');
  });

  return (
    <form className="form" onSubmit={onSubmit}>
      <Field label="Nombre del local" name="nombreLocal" required />
      <SelectField label="Categoría / giro" name="categoria" required value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="" disabled>Elige una categoría</option>
        {categorias.map((c) => (
          <option key={c.slug} value={c.slug}>{c.nombre}</option>
        ))}
      </SelectField>
      {subcategorias.length > 0 && (
        <SelectField label="Subcategoría (opcional)" name="subcategoria" defaultValue="">
          <option value="">Sin subcategoría</option>
          {subcategorias.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </SelectField>
      )}
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

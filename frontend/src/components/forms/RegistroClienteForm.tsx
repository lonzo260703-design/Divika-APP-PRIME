'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { pedirCodigo, soloDigitos } from '@/lib/codigo';
import { Button } from '../ui/Button';
import { IconField } from '../ui/IconField';
import { IconLock, IconMail, IconPhone, IconUser } from '../ui/icons';
import { useFormulario } from './useFormulario';

export function RegistroClienteForm() {
  const router = useRouter();
  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    const telefono = soloDigitos(datos.telefono).slice(-10);
    if (telefono.length < 10) throw new Error('Teléfono inválido. Verifica que el número sea correcto');
    if (datos.password !== datos.confirmar) throw new Error('Las contraseñas no coinciden');

    // La sesión no se guarda aquí: se inicia hasta confirmar el código
    await api('/auth/registro/cliente', {
      method: 'POST',
      body: { nombre: datos.nombre, email: datos.email, telefono, password: datos.password },
    });
    try {
      await pedirCodigo('sms', telefono);
    } catch {
      throw new Error('Tu cuenta se creó, pero no pudimos enviar el código. Entra con "Ya tengo cuenta" para recibirlo');
    }
    router.push('/codigo');
  });

  return (
    <form className="form" onSubmit={onSubmit}>
      <IconField icon={<IconUser />} label="Nombre completo" name="nombre" required autoComplete="name" />
      <IconField icon={<IconPhone />} label="Número de teléfono" name="telefono" type="tel" inputMode="numeric" required autoComplete="tel-national" />
      <IconField icon={<IconMail />} label="Email" name="email" type="email" required autoComplete="email" />
      <IconField icon={<IconLock />} label="Contraseña (mínimo 8 caracteres)" name="password" type="password" minLength={8} required autoComplete="new-password" />
      <IconField icon={<IconLock />} label="Repetir contraseña" name="confirmar" type="password" minLength={8} required autoComplete="new-password" />
      {error && <p className="form__error">{error}</p>}
      <Button type="submit" className="btn--block" disabled={cargando}>
        {cargando ? 'Creando cuenta…' : 'Registrarme'}
      </Button>
    </form>
  );
}

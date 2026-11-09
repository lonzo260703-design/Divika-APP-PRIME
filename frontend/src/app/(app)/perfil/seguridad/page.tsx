'use client';

import { FormEvent, useState } from 'react';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { Button } from '@/components/ui/Button';
import { IconField } from '@/components/ui/IconField';
import { Interruptor } from '@/components/ui/Interruptor';
import { IconLock } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { useCuenta } from '@/lib/useCuenta';

export default function SeguridadPage() {
  const { cuenta } = useCuenta();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function cambiar(e: FormEvent) {
    e.preventDefault();
    setError('');
    setOk('');
    if (nueva !== repetir) return setError('Las contraseñas nuevas no coinciden');
    setGuardando(true);
    try {
      await api('/cuenta/contrasena', { method: 'POST', body: { actual, nueva } });
      setOk('Contraseña actualizada');
      setActual('');
      setNueva('');
      setRepetir('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <CabeceraPerfil titulo="Seguridad" />
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      {ok && <p className="pantalla-nota" role="status">{ok}</p>}

      <h2 className="seccion-titulo">Cambiar contraseña</h2>
      {cuenta && !cuenta.tienePassword ? (
        <p className="nota-gris">Entras con código o con otra cuenta, así que no tienes contraseña que cambiar.</p>
      ) : (
        <form className="formulario" onSubmit={cambiar}>
          <IconField icon={<IconLock />} type="password" label="Contraseña actual" value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" required />
          <IconField icon={<IconLock />} type="password" label="Contraseña nueva" value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" required />
          <IconField icon={<IconLock />} type="password" label="Repite la contraseña nueva" value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" required />
          <p className="campo-ayuda">Al menos 8 caracteres, una mayúscula y un número.</p>
          <Button className="btn--block" disabled={guardando || !actual || !nueva}>{guardando ? 'Guardando…' : 'Actualizar contraseña'}</Button>
        </form>
      )}

      <h2 className="seccion-titulo">Protección adicional</h2>
      <div className="grupo">
        <div className="ajuste">
          <span className="ajuste__texto">
            <strong>Verificación en dos pasos</strong>
            <small>Próximamente</small>
          </span>
          <Interruptor activo={false} deshabilitado etiqueta="Verificación en dos pasos" />
        </div>
        <div className="ajuste">
          <span className="ajuste__texto">
            <strong>Dispositivos conectados</strong>
            <small>Próximamente</small>
          </span>
        </div>
      </div>
    </>
  );
}

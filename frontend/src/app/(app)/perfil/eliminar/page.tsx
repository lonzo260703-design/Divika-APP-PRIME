'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { Button } from '@/components/ui/Button';
import { IconWarning } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { cerrarSesion } from '@/lib/auth';

export default function EliminarCuentaPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [borrando, setBorrando] = useState(false);

  async function eliminar() {
    setError('');
    setBorrando(true);
    try {
      await api('/cuenta', { method: 'DELETE' });
      cerrarSesion();
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar la cuenta');
      setBorrando(false);
    }
  }

  return (
    <>
      <CabeceraPerfil titulo="Eliminar cuenta" />
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <div className="eliminar">
        <span className="eliminar__sello"><IconWarning /></span>
        <h2>¿Seguro que quieres eliminar tu cuenta?</h2>
        <p>Esta acción es permanente y no se puede deshacer.</p>
      </div>
      <div className="grupo">
        <div className="ajuste"><span className="ajuste__texto"><strong>Se borra tu perfil</strong><small>Nombre, correo, teléfono y foto</small></span></div>
        <div className="ajuste"><span className="ajuste__texto"><strong>Se borran tus favoritos y reseñas</strong><small>No podrás recuperarlos</small></span></div>
        <div className="ajuste"><span className="ajuste__texto"><strong>Se cierra tu sesión</strong><small>En todos los dispositivos</small></span></div>
      </div>
      <Button variant="secondary" className="btn--block btn--borde" onClick={() => router.push('/perfil')}>Cancelar</Button>
      <Button className="btn--block btn--peligro" disabled={borrando} onClick={eliminar}>{borrando ? 'Eliminando…' : 'Sí, eliminar mi cuenta'}</Button>
    </>
  );
}

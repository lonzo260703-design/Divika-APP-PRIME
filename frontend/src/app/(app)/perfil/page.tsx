'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cerrarSesion, getUsuario } from '@/lib/auth';
import type { Usuario } from '@/types';

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => setUsuario(getUsuario()), []);

  function salir() {
    cerrarSesion();
    router.push('/');
  }

  return (
    <>
      <h1 className="seccion">Mi perfil</h1>
      {usuario && (
        <dl className="datos">
          <dt>Nombre</dt>
          <dd>{usuario.nombre}</dd>
          <dt>Correo</dt>
          <dd>{usuario.email}</dd>
          <dt>Tipo de cuenta</dt>
          <dd>{usuario.rol === 'negocio' ? 'Negocio' : 'Cliente'}</dd>
        </dl>
      )}
      <Button variant="secondary" onClick={salir}>Cerrar sesión</Button>
    </>
  );
}

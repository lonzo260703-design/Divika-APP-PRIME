'use client';

import { Notificaciones } from '@/components/perfil/Notificaciones';

export default function Page() {
  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Notificaciones</h1>
      <Notificaciones cabecera={false} />
    </div>
  );
}

'use client';

import { Seguridad } from '@/components/perfil/Seguridad';

export default function Page() {
  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Seguridad</h1>
      <Seguridad cabecera={false} />
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';
import { getToken } from '@/lib/auth';

export default function VerificadoPage() {
  const router = useRouter();
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace('/');
    else setListo(true);
  }, [router]);

  if (!listo) return null;

  return (
    <main className="screen screen--bienvenida">
      <div className="screen__centro verificado">
        <div className="verificado__sello"><IconCheck /></div>
        <h1 className="titulo">Verificación completada</h1>
        <p className="subtitulo">Tu registro está listo. Ya puedes acceder y explorar los servicios cerca de ti.</p>
      </div>
      <div className="acciones">
        <ButtonLink href="/home" className="btn--block">Explorar servicios</ButtonLink>
      </div>
    </main>
  );
}

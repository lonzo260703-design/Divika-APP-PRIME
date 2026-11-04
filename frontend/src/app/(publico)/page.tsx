'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Aviso } from '@/components/ui/Aviso';
import { ButtonLink, Button } from '@/components/ui/Button';
import { IconApple, IconGoogle } from '@/components/ui/icons';

export default function Bienvenida() {
  const [aviso, setAviso] = useState('');

  return (
    <main className="screen screen--bienvenida">
      <div className="screen__centro">
        <Logo />
      </div>

      <div className="acciones">
        {aviso && <Aviso onClose={() => setAviso('')}>{aviso}</Aviso>}
        {/* Apple y Google se activan cuando el backend valide sus tokens */}
        <Button variant="apple" className="btn--block" onClick={() => setAviso('Continuar con Apple estará disponible pronto')}>
          <IconApple /> Continúa con Apple
        </Button>
        <Button variant="google" className="btn--block" onClick={() => setAviso('Continuar con Google estará disponible pronto')}>
          <IconGoogle /> Continúa con Google
        </Button>
        <ButtonLink href="/acceso" variant="accent" className="btn--block">Ya tengo cuenta</ButtonLink>
        <Link href="/registro" className="enlace-centrado">Registrarme</Link>
      </div>
    </main>
  );
}

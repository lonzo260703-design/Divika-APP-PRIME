'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RegistroClienteForm } from '@/components/forms/RegistroClienteForm';
import { RegistroNegocioForm } from '@/components/forms/RegistroNegocioForm';
import { Atras } from '@/components/layout/Atras';
import { Logo } from '@/components/layout/Logo';
import { cx } from '@/lib/cx';

export default function RegistroPage() {
  const [tipo, setTipo] = useState<'cliente' | 'negocio'>('cliente');

  return (
    <main className="screen screen--pagina">
      <Atras href="/" />
      <Logo pequeno />
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tipo === 'cliente'} className={cx('tabs__tab', tipo === 'cliente' && 'tabs__tab--activa')} onClick={() => setTipo('cliente')}>
          Soy cliente
        </button>
        <button role="tab" aria-selected={tipo === 'negocio'} className={cx('tabs__tab', tipo === 'negocio' && 'tabs__tab--activa')} onClick={() => setTipo('negocio')}>
          Tengo un negocio
        </button>
      </div>
      {tipo === 'cliente' ? <RegistroClienteForm /> : <RegistroNegocioForm />}
      <p className="texto-aparte">
        ¿Ya tienes cuenta? <Link href="/acceso">Inicia sesión</Link>
      </p>
    </main>
  );
}

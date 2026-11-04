'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import { Atras } from '@/components/layout/Atras';
import { Logo } from '@/components/layout/Logo';
import { LoginWeb } from '@/components/web/LoginWeb';
import { useEscritorio } from '@/lib/useEscritorio';

export default function LoginPage() {
  const escritorio = useEscritorio();
  if (escritorio === null) return null;
  if (escritorio) return <LoginWeb tipo="usuario" />;

  return (
    <main className="screen screen--pagina">
      <Atras href="/acceso" />
      <Logo pequeno />
      <LoginForm />
      <p className="texto-aparte">
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </main>
  );
}

import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import { Logo } from '@/components/layout/Logo';

export default function LoginPage() {
  return (
    <main className="screen screen--centro">
      <Logo />
      <LoginForm />
      <p className="texto-aparte">
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </main>
  );
}

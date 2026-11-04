import Link from 'next/link';
import { LoginForm } from '@/components/forms/LoginForm';
import { Atras } from '@/components/layout/Atras';
import { Logo } from '@/components/layout/Logo';

export default function LoginPage() {
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

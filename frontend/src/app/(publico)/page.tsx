import { Logo } from '@/components/layout/Logo';
import { ButtonLink } from '@/components/ui/Button';

export default function Bienvenida() {
  return (
    <main className="screen screen--centro">
      <Logo />
      <div className="fila">
        <ButtonLink href="/login">Iniciar sesión</ButtonLink>
        <ButtonLink href="/registro" variant="secondary">Registrarse</ButtonLink>
      </div>
    </main>
  );
}

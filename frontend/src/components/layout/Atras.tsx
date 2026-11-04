import Link from 'next/link';
import { IconBack } from '../ui/icons';

export function Atras({ href }: { href: string }) {
  return (
    <Link href={href} className="atras" aria-label="Volver">
      <IconBack />
    </Link>
  );
}

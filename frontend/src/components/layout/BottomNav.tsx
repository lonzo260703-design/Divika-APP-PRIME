'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/cx';
import { IconCalendar, IconHeart, IconHome, IconUser } from '../ui/icons';

const ITEMS = [
  { nombre: 'Inicio', icono: <IconHome />, href: '/home' },
  { nombre: 'Reservaciones', icono: <IconCalendar />, href: '/reservaciones' },
  { nombre: 'Favoritos', icono: <IconHeart />, href: '/favoritos' },
  { nombre: 'Perfil', icono: <IconUser />, href: '/perfil' },
];

export function BottomNav() {
  const ruta = usePathname();
  // Categorías y detalle de negocio cuelgan de Inicio
  const activo = (href: string) => ruta === href || (href === '/home' && /^\/(categoria|negocio)\//.test(ruta));
  return (
    <nav className="nav" aria-label="Navegación principal">
      {ITEMS.map(({ nombre, icono, href }) => (
        <Link
          key={nombre}
          href={href}
          aria-label={nombre}
          aria-current={activo(href) ? 'page' : undefined}
          className={cx('nav__item', activo(href) && 'nav__item--activo')}
        >
          {icono}
        </Link>
      ))}
    </nav>
  );
}

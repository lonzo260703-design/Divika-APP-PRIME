'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/cx';

// Sin href = todavía no existe esa pantalla (se ve apagado)
const ITEMS = [
  { nombre: 'Inicio', icono: '🏠', href: '/home' },
  { nombre: 'Explorar', icono: '☰', href: undefined },
  { nombre: 'Pedidos', icono: '🛍️', href: undefined },
  { nombre: 'Perfil', icono: '👤', href: '/perfil' },
];

export function BottomNav() {
  const ruta = usePathname();
  return (
    <nav className="nav">
      {ITEMS.map(({ nombre, icono, href }) =>
        href ? (
          <Link key={nombre} href={href} aria-label={nombre} className={cx('nav__item', ruta === href && 'nav__item--activo')}>
            {icono}
          </Link>
        ) : (
          <span key={nombre} aria-label={`${nombre} (próximamente)`} className="nav__item nav__item--apagado">
            {icono}
          </span>
        ),
      )}
    </nav>
  );
}

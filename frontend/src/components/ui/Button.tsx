import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';
import { cx } from '@/lib/cx';

type Variante = 'primary' | 'secondary';

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variante }) {
  return <button className={cx('btn', `btn--${variant}`, className)} {...props} />;
}

// Mismo estilo pero para navegar entre páginas
export function ButtonLink({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variante }) {
  return <Link className={cx('btn', `btn--${variant}`, className)} {...props} />;
}

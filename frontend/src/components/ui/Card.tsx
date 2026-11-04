import type { HTMLAttributes, ImgHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';

/**
 * UNA sola card para todo (adaptada de card-featured de React Native a web).
 * Se arma por piezas:
 *
 *   <Card variant="overlay">   ← imagen de fondo + texto encima (Top 10)
 *   <Card variant="stack">     ← imagen arriba + texto abajo   (Cerca de ti)
 *   <Card variant="grid">      ← versión compacta para cuadrícula de 2 columnas (listado por categoría)
 *     <Card.Image src="..." />
 *     <Card.Overlay />         ← degradado oscuro (solo overlay)
 *     <Card.Badge number={1} /> ← listón negro con número
 *     <Card.Content>
 *       <Card.Title>…</Card.Title>
 *       <Card.Subtitle>…</Card.Subtitle>
 *     </Card.Content>
 *   </Card>
 *
 * Para una card nueva NO crees otro componente: combina estas piezas.
 */

type DivProps = HTMLAttributes<HTMLDivElement>;

type CardProps = DivProps & { variant?: 'overlay' | 'stack' | 'grid' };

export function Card({ variant = 'overlay', className, ...props }: CardProps) {
  return <div className={cx('card', `card--${variant}`, className)} {...props} />;
}

function CardImage({ className, alt = '', src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  // Sin imagen: muestra un recuadro vacío en vez de una imagen rota
  if (!src) return <div className={cx('card__image', 'card__image--vacio', className)}>🖼️</div>;
  return <img className={cx('card__image', className)} src={src} alt={alt} {...props} />;
}

function CardOverlay() {
  return <div className="card__overlay" />;
}

function CardBadge({ number }: { number: number }) {
  return <div className="card__badge">{number}</div>;
}

function CardContent({ className, ...props }: DivProps) {
  return <div className={cx('card__content', className)} {...props} />;
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cx('card__title', className)} {...props} />;
}

function CardSubtitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx('card__subtitle', className)} {...props} />;
}

Card.Image = CardImage;
Card.Overlay = CardOverlay;
Card.Badge = CardBadge;
Card.Content = CardContent;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;

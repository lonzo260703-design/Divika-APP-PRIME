import { IconStar } from '../ui/icons';

// 5 estrellas; las llenas son la calificación redondeada hacia abajo
export function Estrellas({ valor }: { valor: number }) {
  const llenas = Math.floor(valor);
  return (
    <span className="estrellas" role="img" aria-label={`${valor.toFixed(1)} de 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < llenas ? 'estrella estrella--llena' : 'estrella'}><IconStar /></span>
      ))}
    </span>
  );
}

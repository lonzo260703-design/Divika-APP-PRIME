import { CATEGORIAS } from '@/lib/categorias';
import { cx } from '@/lib/cx';

type Props = { activa: string | null; onSelect: (slug: string | null) => void };

// Los 8 iconos del recuadro morado. Tocar uno filtra; tocarlo otra vez quita el filtro.
export function CategoryGrid({ activa, onSelect }: Props) {
  return (
    <div className="categorias">
      {CATEGORIAS.map((c) => (
        <button
          key={c.slug}
          type="button"
          title={c.nombre}
          aria-label={c.nombre}
          aria-pressed={activa === c.slug}
          className={cx('categorias__item', activa === c.slug && 'categorias__item--activa')}
          onClick={() => onSelect(activa === c.slug ? null : c.slug)}
        >
          {c.icono}
        </button>
      ))}
    </div>
  );
}

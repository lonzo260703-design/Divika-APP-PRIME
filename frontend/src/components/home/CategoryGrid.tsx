import { CATEGORIAS } from '@/lib/categorias';
import { cx } from '@/lib/cx';
import { ICONOS_CATEGORIA } from './categoriaIconos';

type Props = { activa: string | null; onSelect: (slug: string | null) => void };

// Casillas en dos filas con desplazamiento horizontal. Tocar una filtra; tocarla otra vez quita el filtro.
export function CategoryGrid({ activa, onSelect }: Props) {
  return (
    <div className="categorias">
      {CATEGORIAS.map((c) => (
        <button
          key={c.slug}
          type="button"
          aria-pressed={activa === c.slug}
          className={cx('categorias__item', activa === c.slug && 'categorias__item--activa')}
          onClick={() => onSelect(activa === c.slug ? null : c.slug)}
        >
          {ICONOS_CATEGORIA[c.slug]}
          <span className="categorias__nombre">{c.nombre}</span>
        </button>
      ))}
    </div>
  );
}

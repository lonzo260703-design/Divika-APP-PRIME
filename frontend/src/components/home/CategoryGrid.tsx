import type { CategoriaInfo } from '@/types';
import { ICONO_GENERICO, ICONOS_CATEGORIA } from './categoriaIconos';

type Props = { categorias: CategoriaInfo[]; onSelect: (slug: string) => void };

// Casillas en dos filas con desplazamiento horizontal. Al tocar una se abre su listado.
export function CategoryGrid({ categorias, onSelect }: Props) {
  return (
    <div className="categorias">
      {categorias.map((c) => (
        <button key={c.slug} type="button" className="categorias__item" onClick={() => onSelect(c.slug)}>
          {ICONOS_CATEGORIA[c.slug] ?? ICONO_GENERICO}
          <span className="categorias__nombre">{c.nombre}</span>
        </button>
      ))}
    </div>
  );
}

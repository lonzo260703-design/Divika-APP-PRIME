'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useState } from 'react';
import { ICONOS_CATEGORIA, ICONO_GENERICO } from '../home/categoriaIconos';
import { Cabecera } from './Cabecera';
import { Pie } from './Pie';
import { useCategorias } from '@/lib/categorias';
import { cx } from '@/lib/cx';

// La pantalla (p. ej. el detalle de un negocio) le dice al marco qué categoría resaltar en la barra
const Ctx = createContext<(slug: string | null) => void>(() => {});
export const useCategoriaActiva = () => useContext(Ctx);

function BarraCategorias({ activa }: { activa: string | null }) {
  const { categorias } = useCategorias();
  return (
    <nav className="wa-cats" aria-label="Categorías">
      {categorias.map((c) => (
        <Link key={c.slug} href={`/categoria/${c.slug}`} className={cx('wa-cats__item', activa === c.slug && 'wa-cats__item--activa')} aria-current={activa === c.slug ? 'page' : undefined}>
          {ICONOS_CATEGORIA[c.slug] ?? ICONO_GENERICO}<span>{c.nombre}</span>
        </Link>
      ))}
    </nav>
  );
}

function PieSimple() {
  return (
    <footer className="wa-pie">
      <span><strong>DIVIKA</strong> Tu comunidad, más cerca.</span>
      <span className="wa-pie__links"><Link href="/perfil/soporte">Ayuda</Link><span>Privacidad</span><span>© 2026 DIVIKA</span></span>
    </footer>
  );
}

// Marco de escritorio de las pantallas del cliente con sesión: cabecera, barra de categorías y pie
export function MarcoWeb({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  const [activaPantalla, setActiva] = useState<string | null>(null);
  const inicio = ruta === '/home';
  const categoria = ruta.startsWith('/categoria/') ? ruta.split('/')[2] : null;
  const detalle = /^\/negocio\/[^/]+$/.test(ruta);
  const conBarra = !inicio && (!!categoria || ruta.startsWith('/negocio/'));
  // Las pantallas con diseño web usan todo el ancho; las demás (perfil, favoritos...) van en una columna centrada
  const ancho = inicio || !!categoria || detalle;

  return (
    <Ctx.Provider value={setActiva}>
      <div className="web-pagina wa">
        <Cabecera variante={inicio ? 'inicio' : 'interior'} />
        {conBarra && <BarraCategorias activa={categoria ?? activaPantalla} />}
        <main className={cx('wa-contenido', !ancho && 'wa-contenido--estrecho')}>{children}</main>
        {inicio ? <Pie /> : <PieSimple />}
      </div>
    </Ctx.Provider>
  );
}

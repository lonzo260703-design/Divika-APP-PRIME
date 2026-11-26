'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useState } from 'react';
import { Cabecera } from './Cabecera';
import { BannerApp, PieSimple } from './Pie';
import { LateralCuenta, esRutaCuenta } from '../cuenta/Cuenta';
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
          <span>{c.nombre}</span>
        </Link>
      ))}
    </nav>
  );
}

// Marco de escritorio de las pantallas del cliente con sesión: cabecera, barra de categorías y pie
export function MarcoWeb({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  const [activaPantalla, setActiva] = useState<string | null>(null);
  const inicio = ruta === '/home';
  const categoria = ruta.startsWith('/categoria/') ? ruta.split('/')[2] : null;
  const detalle = /^\/negocio\/[^/]+(\/reservar)?$/.test(ruta);
  const conBarra = !inicio && (!!categoria || ruta.startsWith('/negocio/'));
  // Las pantallas con diseño web usan todo el ancho; las demás (perfil, favoritos...) van en una columna centrada
  const ancho = inicio || !!categoria || detalle;
  // "Mi cuenta" (perfil, reservas, favoritos…): menú lateral + contenido
  const cuenta = esRutaCuenta(ruta) || ruta === '/reservaciones' || ruta === '/favoritos';

  return (
    <Ctx.Provider value={setActiva}>
      <div className="web-pagina wa">
        <Cabecera variante={inicio ? 'inicio' : 'interior'} />
        {conBarra && <BarraCategorias activa={categoria ?? activaPantalla} />}
        {cuenta ? (
          <div className="cta">
            <LateralCuenta />
            <main className="cta-main">{children}</main>
          </div>
        ) : (
          <main className={cx('wa-contenido', !ancho && 'wa-contenido--estrecho')}>{children}</main>
        )}
        {inicio && <BannerApp />}
        <PieSimple corto={/\/reservar$/.test(ruta)} />
      </div>
    </Ctx.Provider>
  );
}

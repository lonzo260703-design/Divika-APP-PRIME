'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUsuario } from '@/lib/auth';
import { cx } from '@/lib/cx';
import type { Usuario } from '@/types';

// Barra superior de la versión web (diseño "Inicio mejorado"): logo, Explorar servicios, Cómo funciona,
// Guardados, sesión y botón para negocios. La búsqueda vive en el hero y en los listados.
export function Cabecera({ variante = 'inicio' }: { variante?: 'inicio' | 'interior' }) {
  const ruta = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  useEffect(() => setUsuario(getUsuario()), []);

  const inicio = usuario ? '/home' : '/';
  const explorando = variante === 'interior' || ruta === '/home' || ruta === '/';

  return (
    <header className="web-cab">
      <Link href={inicio} aria-label="Divika, inicio" className="web-cab__logo"><img src="/logo.png" alt="Divika" /></Link>
      <nav className="web-cab__nav" aria-label="Explorar">
        <Link href="/home?todos=1" className={cx('web-cab__enlace', explorando && 'web-cab__enlace--fuerte')}>Explorar servicios</Link>
        <Link href={`${inicio}#como-funciona`} className="web-cab__enlace web-cab__enlace--suave">Cómo funciona</Link>
      </nav>
      <nav className="web-cab__links" aria-label="Principal">
        {usuario ? (
          <>
            {usuario.rol !== 'negocio' && <Link href="/reservaciones" className="web-cab__enlace">Mis reservas</Link>}
            <Link href="/favoritos" className="web-cab__enlace web-cab__enlace--morado">Guardados</Link>
            <Link href={usuario.rol === 'negocio' ? '/portal' : '/perfil'} className="web-cab__boton">{usuario.rol === 'negocio' ? 'Mi portal' : 'Mi cuenta'}</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="web-cab__enlace web-cab__enlace--morado">Guardados</Link>
            <Link href="/login" className="web-cab__enlace">Iniciar sesión</Link>
            <Link href="/proveedores" className="web-cab__boton">Registrar mi negocio</Link>
          </>
        )}
      </nav>
    </header>
  );
}

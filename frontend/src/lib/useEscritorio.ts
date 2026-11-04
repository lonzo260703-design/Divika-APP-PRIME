'use client';

import { useEffect, useState } from 'react';

export const ANCHO_ESCRITORIO = 900;

// true en pantalla ancha (versión web), false en celular/tablet angosta.
// Vale null en el primer render (todavía no se sabe el ancho): las páginas no pintan nada hasta entonces.
export function useEscritorio(): boolean | null {
  const [esc, setEsc] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${ANCHO_ESCRITORIO}px)`);
    const actualizar = () => setEsc(mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);
  return esc;
}

import type { ReactNode } from 'react';

// Pantalla provisional para secciones que ya están en el diseño pero aún no tienen backend
export function Proximamente({ icono, titulo, texto }: { icono: ReactNode; titulo: string; texto: string }) {
  return (
    <div className="vacio">
      <div className="vacio__sello">{icono}</div>
      <h1 className="titulo">{titulo}</h1>
      <p className="subtitulo">{texto}</p>
    </div>
  );
}

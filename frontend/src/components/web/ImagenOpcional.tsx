'use client';

import { useEffect, useRef, useState } from 'react';

// Imagen del diseño que se pone en frontend/public/web/. Si el archivo todavía no existe, muestra un recuadro
// en lugar de una imagen rota, así la página se ve bien mientras diseño entrega los archivos.
export function ImagenOpcional({ src, alt, className, etiqueta }: { src: string; alt: string; className?: string; etiqueta?: string }) {
  const [falla, setFalla] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Si la imagen ya falló antes de que React enganchara el evento (pasa con la página recién cargada)
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFalla(true);
  }, []);
  if (falla) {
    return (
      <div className={`web-ph ${className ?? ''}`} role="img" aria-label={alt}>
        <span>{etiqueta ?? alt}</span>
      </div>
    );
  }
  return <img ref={ref} src={src} alt={alt} className={className} onError={() => setFalla(true)} />;
}

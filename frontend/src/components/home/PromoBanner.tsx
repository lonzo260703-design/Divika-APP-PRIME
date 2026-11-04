'use client';

import { useState } from 'react';

// Banner de promociones. Si agregas frontend/public/banner-inicio.png (la foto de las personas
// del diseño) aparece solo; mientras no exista, se ve únicamente el texto y la forma azul.
export function PromoBanner() {
  const [hayImagen, setHayImagen] = useState(true);
  return (
    <div className="promo">
      <div className="promo__texto">
        <span>Explora servicios,</span>
        <span className="promo__rojo">Rápido y seguro</span>
      </div>
      {hayImagen && (
        <img className="promo__imagen" src="/banner-inicio.png" alt="" onError={() => setHayImagen(false)} />
      )}
    </div>
  );
}

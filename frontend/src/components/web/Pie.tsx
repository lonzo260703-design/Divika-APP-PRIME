'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ImagenOpcional } from './ImagenOpcional';

function Tiendas() {
  return (
    <div className="web-tiendas">
      <span className="web-tienda"><small>Descárgala en</small><strong>App Store</strong></span>
      <span className="web-tienda"><small>Disponible en</small><strong>Google Play</strong></span>
    </div>
  );
}

// Banner "La app de servicios" + pie de página, iguales en todo el sitio público
export function Pie() {
  const [aviso, setAviso] = useState('');
  return (
    <>
      <section className="web-banner">
        <ImagenOpcional src="/web/banner-app.png" alt="Pareja usando la app de Divika" etiqueta="Imagen: banner-app.png" className="web-banner__img" />
        <div className="web-banner__texto">
          <h2><span>DIVIKA</span></h2>
          <p className="web-banner__lema">LA APP DE SERVICIOS</p>
          <p>Descarga la app para celular ya disponible</p>
          <Tiendas />
        </div>
      </section>

      <footer className="web-pie">
        <div className="web-pie__col web-pie__marca">
          <img src="/logo.png" alt="Divika" />
          <Tiendas />
          <p>Divika · Encuentra, conecta y descubre</p>
        </div>
        <div className="web-pie__col">
          <h3>Recibe ofertas exclusivas</h3>
          <form
            className="web-pie__suscribir"
            onSubmit={(e) => { e.preventDefault(); setAviso('La suscripción estará disponible pronto.'); }}
          >
            <input type="email" required placeholder="tucorreo@gmail.com" aria-label="Correo" />
            <button type="submit">Suscribirme</button>
          </form>
          {aviso && <p className="web-pie__aviso" role="status">{aviso}</p>}
        </div>
        <div className="web-pie__col">
          <h3>Legal</h3>
          <ul><li>Términos y condiciones</li><li>Aviso de privacidad</li></ul>
        </div>
        <div className="web-pie__col">
          <h3>Divika</h3>
          <ul>
            <li><Link href="/proveedores">Anuncia tu negocio</Link></li>
            <li><Link href="/login/proveedores">Acceso para proveedores</Link></li>
          </ul>
        </div>
      </footer>
      <div className="web-pie__legal">© 2026 Divika. Todos los derechos reservados.</div>
    </>
  );
}

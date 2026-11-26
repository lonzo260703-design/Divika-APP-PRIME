'use client';

import Link from 'next/link';
import { ImagenOpcional } from './ImagenOpcional';

// Banner "La app de servicios" (diseño "Inicio mejorado" en Figma)
export function BannerApp() {
  return (
    <section className="ban">
      <div className="ban__grid">
        <ImagenOpcional src="/web/banner-figma.jpg" alt="Divika: explora tu ciudad desde la app" etiqueta="Imagen: banner-figma.jpg" className="ban__img" />
        <div className="ban__texto">
          <h2>DIVIKA<br />La app de servicios</h2>
          <p>Descarga la app para celular, ya disponible. Tus lugares, favoritos y reservaciones contigo.</p>
          <div className="ban__tiendas">
            <span className="ban__tienda ban__tienda--llena">App Store</span>
            <span className="ban__tienda">Google Play</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Pie sencillo (diseño "Inicio mejorado"). corto = una sola línea (pantallas de acceso)
export function PieSimple({ corto = false, legal = 'Negocios y datos de ejemplo. Confirma precios y disponibilidad con cada establecimiento.' }: { corto?: boolean; legal?: string }) {
  return (
    <footer className={`wa-pie${corto ? ' wa-pie--corto' : ''}`}>
      <div className="wa-pie__fila">
        <span className="wa-pie__marca"><strong>DIVIKA</strong>{corto ? '· ' : ''}Tu comunidad, más cerca.</span>
        <nav className="wa-pie__links" aria-label="Pie de página">
          <Link href="/perfil/soporte">Ayuda</Link>
          <span>Privacidad</span>
          <span>Términos</span>
          {corto ? <span>© 2026 DIVIKA</span> : <Link href="/perfil/soporte">Contacto</Link>}
        </nav>
      </div>
      {!corto && <p className="wa-pie__legal">© 2026 DIVIKA · {legal}</p>}
    </footer>
  );
}

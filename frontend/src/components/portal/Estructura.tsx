'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { cx } from '@/lib/cx';
import { cerrarSesion } from '@/lib/auth';
import { IconBell, IconCalendar, IconCard, IconChat, IconClipboard, IconExternal, IconGrid, IconMenu, IconPin, IconScissors, IconStar, IconStore } from '../ui/icons';
import { ESTADO_TEXTO, iniciales, usePortal } from './PortalContext';

export const SECCIONES = [
  { slug: '', nombre: 'Inicio', icono: <IconGrid /> },
  { slug: 'perfil', nombre: 'Perfil del negocio', icono: <IconStore /> },
  { slug: 'servicios', nombre: 'Mis servicios', icono: <IconScissors /> },
  { slug: 'cobertura', nombre: 'Ubicación y cobertura', icono: <IconPin /> },
  { slug: 'pagos', nombre: 'Formas de pago', icono: <IconCard /> },
  { slug: 'calendario', nombre: 'Calendario', icono: <IconCalendar /> },
  { slug: 'solicitudes', nombre: 'Solicitudes y citas', icono: <IconClipboard /> },
  { slug: 'mensajes', nombre: 'Mensajes', icono: <IconChat /> },
  { slug: 'notificaciones', nombre: 'Notificaciones', icono: <IconBell /> },
  { slug: 'resenas', nombre: 'Reseñas y ajustes', icono: <IconStar /> },
];

function Ayuda() {
  return (
    <div className="p-ayuda">
      <strong>Estamos para ayudarte</strong>
      <p>Encuentra respuestas para gestionar tu negocio.</p>
      <span>Centro de ayuda ↗</span>
    </div>
  );
}

// Tarjeta del negocio (arriba del menú lateral)
export function TarjetaNegocio() {
  const { negocio } = usePortal();
  const estado = negocio.estado ?? 'publicado';
  return (
    <div className="p-negocio">
      <span className="p-avatar">{iniciales(negocio.nombre)}</span>
      <div>
        <strong>{negocio.nombre}</strong>
        <small>{[negocio.colonia, negocio.ciudad].filter(Boolean).join(' · ') || 'Sin ubicación'}</small>
      </div>
      <span className={cx('p-estado', `p-estado--${estado}`)}>{ESTADO_TEXTO[estado]}</span>
    </div>
  );
}

// Menú lateral + barra superior del portal del proveedor
export function Estructura({ children }: { children: ReactNode }) {
  const { usuario, negocio } = usePortal();
  const ruta = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [cuenta, setCuenta] = useState(false);
  const activo = (slug: string) => (slug ? ruta.startsWith(`/portal/${slug}`) : ruta === '/portal');
  const nombreCompleto = [usuario.nombre, usuario.apellidos].filter(Boolean).join(' ');

  return (
    <div className="portal">
      <aside className={cx('p-lateral', menu && 'p-lateral--abierto')}>
        <Link href="/" className="p-logo" aria-label="Divika, inicio"><img src="/logo.png" alt="Divika" /></Link>
        <TarjetaNegocio />
        <nav aria-label="Portal del proveedor">
          {SECCIONES.map((s) => (
            <Link key={s.slug} href={`/portal${s.slug ? `/${s.slug}` : ''}`} onClick={() => setMenu(false)} className={cx('p-nav', activo(s.slug) && 'p-nav--activo')} aria-current={activo(s.slug) ? 'page' : undefined}>
              {s.icono} {s.nombre}
            </Link>
          ))}
        </nav>
        <Ayuda />
        <small className="p-pie">© 2026 Divika · Privacidad</small>
      </aside>

      <div className="p-principal">
        <header className="p-barra-sup">
          <button type="button" className="p-hamburguesa" onClick={() => setMenu((m) => !m)} aria-label="Abrir menú"><IconMenu /></button>
          <span className="p-barra-sup__titulo">Portal de proveedores</span>
          {negocio.estado === 'publicado' ? (
            <Link href={`/negocio/${negocio.id}`} className="p-barra-sup__enlace">Ver mi perfil público <IconExternal /></Link>
          ) : null}
          <span className="p-campana" aria-label="Notificaciones"><IconBell /></span>
          <div className="p-cuenta">
            <button type="button" onClick={() => setCuenta((c) => !c)} aria-expanded={cuenta}>
              <span className="p-avatar p-avatar--chico">{iniciales(nombreCompleto)}</span>
              <span className="p-cuenta__texto"><strong>{nombreCompleto}</strong><small>Administrador</small></span>
            </button>
            {cuenta && (
              <div className="p-cuenta__menu">
                <button type="button" onClick={() => { cerrarSesion(); router.replace('/login/proveedores'); }}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </header>
        <main className="p-contenido">{children}</main>
      </div>
      {menu && <button type="button" className="p-velo" onClick={() => setMenu(false)} aria-label="Cerrar menú" />}
    </div>
  );
}

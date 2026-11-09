'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { ESTADO_TEXTO, iniciales, usePortal } from '@/components/portal/PortalContext';
import { IconBell, IconCard, IconChevron, IconExternal, IconLogout, IconPin, IconShield, IconStore } from '@/components/ui/icons';
import { cerrarSesion } from '@/lib/auth';

// Pestaña "Perfil" de la app móvil del proveedor
export default function CuentaProveedor() {
  const { usuario, negocio } = usePortal();
  const router = useRouter();
  const nombre = [usuario.nombre, usuario.apellidos].filter(Boolean).join(' ');
  const opciones: [string, ReactNode, string][] = [
    ['Perfil del negocio', <IconStore key="a" />, '/portal/perfil'],
    ['Métodos de pago', <IconCard key="b" />, '/portal/pagos'],
    ['Ubicación y cobertura', <IconPin key="c" />, '/portal/cobertura'],
    ['Notificaciones', <IconBell key="d" />, '/portal/notificaciones'],
    ['Seguridad', <IconShield key="e" />, '/portal/seguridad'],
  ];
  return (
    <div className="p-estrecho">
      <div className="cuenta-cab">
        <span className="p-avatar">{iniciales(nombre)}</span>
        <strong>{nombre}</strong>
        <small>{usuario.email}</small>
        <span className="etiqueta-chica">{negocio.nombre} · {ESTADO_TEXTO[negocio.estado ?? 'publicado']}</span>
      </div>
      <div className="grupo">
        {opciones.map(([t, i, href]) => (
          <Link key={t} href={href} className="ajuste">
            <span className="ajuste__icono">{i}</span>
            <span className="ajuste__texto"><strong>{t}</strong></span>
            <span className="ajuste__flecha"><IconChevron /></span>
          </Link>
        ))}
        {negocio.estado === 'publicado' && (
          <Link href={`/negocio/${negocio.id}`} className="ajuste">
            <span className="ajuste__icono"><IconExternal /></span>
            <span className="ajuste__texto"><strong>Ver mi perfil público</strong></span>
          </Link>
        )}
        <button type="button" className="ajuste" onClick={() => { cerrarSesion(); router.replace('/login/proveedores'); }}>
          <span className="ajuste__icono"><IconLogout /></span>
          <span className="ajuste__texto"><strong>Cerrar sesión</strong></span>
        </button>
      </div>
    </div>
  );
}

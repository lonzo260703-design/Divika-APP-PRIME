'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { PortalContext } from '@/components/portal/PortalContext';
import { Estructura } from '@/components/portal/Estructura';
import { api } from '@/lib/api';
import { cerrarSesion, getUsuario } from '@/lib/auth';
import type { Negocio, Usuario } from '@/types';

// Protege todo el portal: solo entra un proveedor con sesión
export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [datos, setDatos] = useState<{ usuario: Usuario; negocio: Negocio } | null>(null);

  useEffect(() => {
    const usuario = getUsuario();
    if (!usuario || usuario.rol !== 'negocio') {
      router.replace('/login/proveedores');
      return;
    }
    api<Negocio>('/proveedor/negocio')
      .then((negocio) => setDatos({ usuario, negocio }))
      .catch(() => { cerrarSesion(); router.replace('/login/proveedores'); });
  }, [router]);

  if (!datos) return null;
  return (
    <PortalContext.Provider value={{ ...datos, setNegocio: (negocio) => setDatos((d) => (d ? { ...d, negocio } : d)) }}>
      <div className="web-pagina"><Estructura>{children}</Estructura></div>
    </PortalContext.Provider>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { iso } from '@/lib/reservas';
import type { Cita } from '@/types';
import { usePortal } from '@/components/portal/PortalContext';

export default function PortalInicio() {
  const { usuario, negocio } = usePortal();
  const enProceso = negocio.estado === 'en_proceso';
  const [citas, setCitas] = useState<Cita[]>([]);
  useEffect(() => { api<Cita[]>('/proveedor/citas').then(setCitas).catch(() => {}); }, []);
  const hoy = iso(new Date());
  return (
    <>
      <h1 className="p-titulo">Hola, {usuario.nombre.split(' ')[0]}</h1>
      <p className="p-sub">Este es el movimiento de {negocio.nombre}.</p>

      <section className="p-tarjeta p-aviso-grande">
        {enProceso ? (
          <>
            <h2>Termina de configurar tu negocio</h2>
            <p>Tu perfil todavía no aparece en el directorio. Completa tu alta para que los clientes te encuentren.</p>
            <Link href="/proveedores/registro" className="p-btn">Continuar mi alta</Link>
          </>
        ) : (
          <>
            <h2>{negocio.estado === 'pausado' ? 'Tu perfil está pausado' : 'Tu perfil está publicado'}</h2>
            <p>{negocio.estado === 'pausado' ? 'No aparece en el directorio hasta que lo vuelvas a publicar.' : 'Los clientes ya pueden encontrarte en Divika.'}</p>
            <Link href="/portal/perfil" className="p-btn p-btn--borde">Editar perfil del negocio</Link>
          </>
        )}
      </section>

      <div className="stats">
        <Link href="/portal/solicitudes" className="stat"><strong>{citas.filter((c) => c.estado === 'solicitada').length}</strong><small>Solicitudes por responder</small></Link>
        <Link href="/portal/calendario" className="stat"><strong>{citas.filter((c) => c.estado === 'confirmada' && c.fecha === hoy).length}</strong><small>Citas hoy</small></Link>
        <div className="stat"><strong>{negocio.calificacion.toFixed(1)}</strong><small>Calificación</small></div>
      </div>
    </>
  );
}

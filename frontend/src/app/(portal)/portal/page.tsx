'use client';

import Link from 'next/link';
import { usePortal } from '@/components/portal/PortalContext';

export default function PortalInicio() {
  const { usuario, negocio } = usePortal();
  const enProceso = negocio.estado === 'en_proceso';
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

      <p className="p-sub">Pronto verás aquí tus visitas, solicitudes y citas.</p>
    </>
  );
}

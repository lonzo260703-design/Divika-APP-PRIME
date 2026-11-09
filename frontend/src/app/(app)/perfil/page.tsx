'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Atras } from '@/components/layout/Atras';
import { Avatar } from '@/components/perfil/Avatar';
import {
  IconCard, IconBell, IconFlag, IconHelp, IconLock, IconLogout, IconShield, IconTrash, IconUser, IconUsers,
} from '@/components/ui/icons';
import { cerrarSesion, getUsuario } from '@/lib/auth';
import { cx } from '@/lib/cx';
import type { Usuario } from '@/types';
import Link from 'next/link';

type Opcion = { texto: string; icono: ReactNode; href?: string; accion?: () => void; peligro?: boolean };

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => setUsuario(getUsuario()), []);

  function salir() {
    cerrarSesion();
    router.push('/');
  }

  const secciones: { titulo: string; opciones: Opcion[] }[] = [
    {
      titulo: 'Cuenta',
      opciones: [
        { texto: 'Editar perfil', icono: <IconUser />, href: '/perfil/editar' },
        { texto: 'Seguridad', icono: <IconShield />, href: '/perfil/seguridad' },
        { texto: 'Notificaciones', icono: <IconBell />, href: '/perfil/notificaciones' },
        { texto: 'Privacidad', icono: <IconLock />, href: '/perfil/privacidad' },
      ],
    },
    {
      titulo: 'Soporte y ayuda',
      opciones: [
        { texto: 'Formas de pago', icono: <IconCard />, href: '/perfil/pagos' },
        { texto: 'Soporte y ayuda', icono: <IconHelp />, href: '/perfil/soporte' },
      ],
    },
    {
      titulo: 'Acciones',
      opciones: [
        { texto: 'Reporta problema', icono: <IconFlag />, href: '/perfil/reportar' },
        { texto: 'Agregar cuenta', icono: <IconUsers />, href: '/perfil/cuentas' },
        { texto: 'Eliminar cuenta', icono: <IconTrash />, href: '/perfil/eliminar', peligro: true },
        { texto: 'Cerrar sesión', icono: <IconLogout />, accion: salir },
      ],
    },
  ];

  return (
    <>
      <div className="cabecera">
        <Atras href="/home" />
        <h1 className="titulo">Perfil</h1>
      </div>

      <Avatar nombre={usuario?.nombre ?? ''} url={usuario?.avatarUrl} editarHref="/perfil/editar" />
      {usuario && (
        <p className="perfil-nombre">
          <strong>{usuario.nombre}</strong>
          <span>{usuario.email}</span>
        </p>
      )}

      {secciones.map(({ titulo, opciones }) => (
        <section key={titulo} className="perfil-seccion">
          <h2 className="menu-titulo">{titulo}</h2>
          <ul className="menu">
            {opciones.map(({ texto, icono, href, accion, peligro }) => (
              <li key={texto}>
                {href ? (
                  <Link href={href} className={cx('menu__item', peligro && 'menu__item--peligro')}>
                    <span aria-hidden>{icono}</span>
                    <span>{texto}</span>
                  </Link>
                ) : (
                  <button type="button" className={cx('menu__item', peligro && 'menu__item--peligro')} onClick={accion}>
                    <span aria-hidden>{icono}</span>
                    <span>{texto}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

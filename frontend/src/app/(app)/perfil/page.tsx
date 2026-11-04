'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Atras } from '@/components/layout/Atras';
import { Aviso } from '@/components/ui/Aviso';
import {
  IconBell, IconCard, IconFlag, IconHelp, IconLock, IconLogout, IconShield, IconTrash, IconUser, IconUsers,
} from '@/components/ui/icons';
import { cerrarSesion, getUsuario } from '@/lib/auth';
import { cx } from '@/lib/cx';
import type { Usuario } from '@/types';

type Opcion = { texto: string; icono: ReactNode; accion?: () => void; peligro?: boolean };

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => setUsuario(getUsuario()), []);

  const proximamente = (nombre: string) => () => setAviso(`${nombre} estará disponible pronto`);
  function salir() {
    cerrarSesion();
    router.push('/');
  }

  // Las opciones sin accion avisan "pronto" hasta que exista su pantalla y su backend
  const secciones: { titulo: string; opciones: Opcion[] }[] = [
    {
      titulo: 'Cuenta',
      opciones: [
        { texto: 'Editar perfil', icono: <IconUser />, accion: proximamente('Editar perfil') },
        { texto: 'Seguridad', icono: <IconShield />, accion: proximamente('Seguridad') },
        { texto: 'Notificaciones', icono: <IconBell />, accion: proximamente('Notificaciones') },
        { texto: 'Privacidad', icono: <IconLock />, accion: proximamente('Privacidad') },
      ],
    },
    {
      titulo: 'Soporte y ayuda',
      opciones: [
        { texto: 'Formas de pago', icono: <IconCard />, accion: proximamente('Formas de pago') },
        { texto: 'Soporte y ayuda', icono: <IconHelp />, accion: proximamente('Soporte y ayuda') },
      ],
    },
    {
      titulo: 'Acciones',
      opciones: [
        { texto: 'Reporta problema', icono: <IconFlag />, accion: proximamente('Reportar un problema') },
        { texto: 'Agregar cuenta', icono: <IconUsers />, accion: proximamente('Agregar cuenta') },
        { texto: 'Eliminar cuenta', icono: <IconTrash />, accion: proximamente('Eliminar cuenta'), peligro: true },
        { texto: 'Cerrar sesión', icono: <IconLogout />, accion: salir },
      ],
    },
  ];

  const inicial = usuario?.nombre.trim().charAt(0).toUpperCase() ?? '';

  return (
    <>
      <div className="perfil-cabecera">
        <Atras href="/home" />
        <h1 className="titulo">Perfil</h1>
      </div>

      {aviso && <Aviso onClose={() => setAviso('')}>{aviso}</Aviso>}

      <div className="avatar" aria-hidden>{inicial}</div>
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
            {opciones.map(({ texto, icono, accion, peligro }) => (
              <li key={texto}>
                <button type="button" className={cx('menu__item', peligro && 'menu__item--peligro')} onClick={accion}>
                  <span aria-hidden>{icono}</span>
                  <span>{texto}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

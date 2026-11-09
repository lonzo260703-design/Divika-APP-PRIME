'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/perfil/Avatar';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Button } from '@/components/ui/Button';
import { getSesion } from '@/lib/auth';
import { cambiarACuenta, listarCuentas, recordarCuenta } from '@/lib/cuentas';
import type { Sesion } from '@/types';

export default function CuentasPage() {
  const router = useRouter();
  const [cuentas, setCuentas] = useState<Sesion[]>([]);
  const [actual, setActual] = useState<number | null>(null);

  useEffect(() => {
    setCuentas(listarCuentas());
    setActual(getSesion()?.usuario.id ?? null);
  }, []);

  function cambiar(id: number) {
    if (cambiarACuenta(id)) window.location.href = '/home';
  }
  function otra(destino: string) {
    // La cuenta actual queda guardada para poder volver a ella
    recordarCuenta(getSesion());
    router.push(destino);
  }

  return (
    <>
      <CabeceraPerfil titulo="Agregar cuenta" />
      <h2 className="seccion-titulo">Cuentas en este dispositivo</h2>
      {cuentas.map((s) => {
        const esActual = s.usuario.id === actual;
        return (
          <button key={s.usuario.id} type="button" className="cuenta-fila" disabled={esActual} onClick={() => cambiar(s.usuario.id)}>
            <Avatar nombre={s.usuario.nombre} url={s.usuario.avatarUrl} tamano="chico" />
            <span><strong>{s.usuario.nombre}</strong><small>{s.usuario.email}</small></span>
            {esActual ? <span className="etiqueta-chica">Actual</span> : <span className="etiqueta-chica">Cambiar</span>}
          </button>
        );
      })}
      <Button variant="secondary" className="btn--block" onClick={() => otra('/login')}>Iniciar sesión con otra cuenta</Button>
      <Button className="btn--block" onClick={() => otra('/registro')}>Crear una cuenta nueva</Button>
      <p className="nota-gris">Las cuentas agregadas se guardan solo en este navegador y se olvidan al cerrar sesión.</p>
      <Link href="/perfil" className="enlace-boton texto-centrado">Volver al perfil</Link>
    </>
  );
}

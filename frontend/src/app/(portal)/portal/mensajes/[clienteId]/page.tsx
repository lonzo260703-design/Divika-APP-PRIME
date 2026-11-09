'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Chat } from '@/components/ui/Chat';
import { api } from '@/lib/api';
import type { Conversacion, MensajeChat } from '@/types';

export default function Conversacion_() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const [nombre, setNombre] = useState('Conversación');
  useEffect(() => {
    api<Conversacion[]>('/proveedor/mensajes').then((l) => { const c = l.find((x) => String(x.con.id) === clienteId); if (c) setNombre(c.con.nombre); }).catch(() => {});
  }, [clienteId]);
  const cargar = useCallback(() => api<MensajeChat[]>(`/proveedor/mensajes/${clienteId}`), [clienteId]);
  const enviar = useCallback((texto: string) => api<MensajeChat>(`/proveedor/mensajes/${clienteId}`, { method: 'POST', body: { texto } }), [clienteId]);
  return (
    <div className="p-estrecho">
      <p><Link href="/portal/mensajes" className="enlace-boton">‹ Mensajes</Link></p>
      <h1 className="p-titulo">{nombre}</h1>
      <Chat yo="negocio" cargar={cargar} enviar={enviar} />
    </div>
  );
}

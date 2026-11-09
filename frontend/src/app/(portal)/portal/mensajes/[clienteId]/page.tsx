'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ListaConversaciones } from '@/components/portal/ListaConversaciones';
import { Chat } from '@/components/ui/Chat';
import { api } from '@/lib/api';
import { useEscritorio } from '@/lib/useEscritorio';
import type { Conversacion, MensajeChat } from '@/types';

export default function Conversacion_() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const escritorio = useEscritorio() === true;
  const [nombre, setNombre] = useState('Conversación');
  useEffect(() => {
    api<Conversacion[]>('/proveedor/mensajes').then((l) => { const c = l.find((x) => String(x.con.id) === clienteId); if (c) setNombre(c.con.nombre); }).catch(() => {});
  }, [clienteId]);
  const cargar = useCallback(() => api<MensajeChat[]>(`/proveedor/mensajes/${clienteId}`), [clienteId]);
  const enviar = useCallback((texto: string) => api<MensajeChat>(`/proveedor/mensajes/${clienteId}`, { method: 'POST', body: { texto } }), [clienteId]);
  const chat = <Chat key={clienteId} yo="negocio" cargar={cargar} enviar={enviar} />;

  if (!escritorio) {
    return (
      <div className="p-estrecho">
        <p><Link href="/portal/mensajes" className="enlace-boton">‹ Mensajes</Link></p>
        <h1 className="p-titulo">{nombre}</h1>
        {chat}
      </div>
    );
  }
  return (
    <div className="p-ancho">
      <h1 className="p-titulo">Mensajes</h1>
      <p className="p-sub">Conversaciones directas con tus clientes, con el contexto de cada solicitud.</p>
      <div className="p-maestro">
        <ListaConversaciones activa={clienteId} />
        <div className="p-tarjeta"><h2>{nombre}</h2>{chat}</div>
      </div>
    </div>
  );
}

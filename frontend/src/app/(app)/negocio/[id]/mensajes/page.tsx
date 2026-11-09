'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Chat } from '@/components/ui/Chat';
import { api } from '@/lib/api';
import type { MensajeChat, Negocio } from '@/types';

export default function MensajesNegocio() {
  const { id } = useParams<{ id: string }>();
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  useEffect(() => { api<Negocio>(`/negocios/${id}`).then(setNegocio).catch(() => {}); }, [id]);
  const cargar = useCallback(() => api<MensajeChat[]>(`/mensajes/negocio/${id}`), [id]);
  const enviar = useCallback((texto: string) => api<MensajeChat>(`/mensajes/negocio/${id}`, { method: 'POST', body: { texto } }), [id]);
  return (
    <div className="reservar">
      <CabeceraPerfil titulo={negocio?.nombre ?? 'Mensajes'} atras={`/negocio/${id}`} />
      <Chat yo="cliente" cargar={cargar} enviar={enviar} />
    </div>
  );
}

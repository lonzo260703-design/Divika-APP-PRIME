'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { api } from '@/lib/api';
import type { Conversacion } from '@/types';

export default function Mensajes() {
  const [lista, setLista] = useState<Conversacion[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api<Conversacion[]>('/proveedor/mensajes').then(setLista).catch((e: Error) => { setError(e.message); setLista([]); }); }, []);
  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Mensajes</h1>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      {lista && lista.length === 0 && <p className="p-sub">Cuando un cliente te escriba, la conversación aparecerá aquí.</p>}
      {lista && lista.length > 0 && (
        <div className="grupo">
          {lista.map((c) => (
            <Link key={c.con.id} href={`/portal/mensajes/${c.con.id}`} className="conv-fila">
              <span className="p-avatar p-avatar--chico">{c.con.nombre.charAt(0).toUpperCase()}</span>
              <span><strong>{c.con.nombre}</strong><small>{c.ultimo.de === 'negocio' ? 'Tú: ' : ''}{c.ultimo.texto}</small></span>
              {c.sinLeer > 0 && <span className="conv-fila__n">{c.sinLeer}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

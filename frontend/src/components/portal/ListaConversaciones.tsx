'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Conversacion } from '@/types';

// Lista de conversaciones del proveedor (con búsqueda); "activa" resalta la abierta
export function ListaConversaciones({ activa }: { activa?: string }) {
  const [lista, setLista] = useState<Conversacion[] | null>(null);
  const [q, setQ] = useState('');
  useEffect(() => {
    const cargar = () => api<Conversacion[]>('/proveedor/mensajes').then(setLista).catch(() => setLista([]));
    cargar();
    const id = setInterval(cargar, 10000);
    return () => clearInterval(id);
  }, []);
  const filtradas = (lista ?? []).filter((c) => c.con.nombre.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="p-tarjeta">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conversación" aria-label="Buscar conversación" className="p-buscar" />
      {lista && filtradas.length === 0 && <p className="p-sub">{lista.length === 0 ? 'Cuando un cliente te escriba, la conversación aparecerá aquí.' : 'Sin resultados.'}</p>}
      {filtradas.map((c) => (
        <Link key={c.con.id} href={`/portal/mensajes/${c.con.id}`} className={`conv-fila${String(c.con.id) === activa ? ' conv-fila--on' : ''}`}>
          <span className="p-avatar p-avatar--chico">{c.con.nombre.charAt(0).toUpperCase()}</span>
          <span><strong>{c.con.nombre}</strong><small>{c.ultimo.de === 'negocio' ? 'Tú: ' : ''}{c.ultimo.texto}</small></span>
          {c.sinLeer > 0 && <span className="conv-fila__n">{c.sinLeer}</span>}
        </Link>
      ))}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Estrellas } from '@/components/negocio/Estrellas';
import { Aviso } from '@/components/ui/Aviso';
import { api } from '@/lib/api';
import type { Resena } from '@/types';

export default function Resenas() {
  const [lista, setLista] = useState<Resena[] | null>(null);
  const [respondiendo, setRespondiendo] = useState<number | null>(null);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const cargar = useCallback(() => api<Resena[]>('/proveedor/resenas').then(setLista).catch((e: Error) => { setError(e.message); setLista([]); }), []);
  useEffect(() => { cargar(); }, [cargar]);

  async function enviar(id: number) {
    setError('');
    try {
      await api(`/proveedor/resenas/${id}/respuesta`, { method: 'POST', body: { texto } });
      setRespondiendo(null);
      setTexto('');
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar');
    }
  }

  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Reseñas</h1>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      {lista && lista.length === 0 && <p className="p-sub">Aún no tienes reseñas.</p>}
      {lista?.map((r) => (
        <div key={r.id} className="cita">
          <div className="cita__cab"><strong>{r.usuario.nombre}</strong><Estrellas valor={r.calificacion} /></div>
          {r.comentario && <small>{r.comentario}</small>}
          {r.respuesta && <p className="resena__respuesta"><strong>Tu respuesta:</strong> {r.respuesta}</p>}
          {respondiendo === r.id ? (
            <>
              <textarea className="p-campo" style={{ padding: 8, border: '1px solid var(--portal-borde)', borderRadius: 8, font: 'inherit', fontSize: 13 }} rows={3} maxLength={500} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu respuesta pública" aria-label="Respuesta" />
              <div className="cita__acciones">
                <button type="button" className="p-btn" disabled={!texto.trim()} onClick={() => enviar(r.id)}>Publicar respuesta</button>
                <button type="button" className="p-btn p-btn--borde" onClick={() => setRespondiendo(null)}>Cancelar</button>
              </div>
            </>
          ) : (
            <div className="cita__acciones">
              <button type="button" className="p-btn p-btn--borde" onClick={() => { setRespondiendo(r.id); setTexto(r.respuesta ?? ''); }}>{r.respuesta ? 'Editar respuesta' : 'Responder'}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

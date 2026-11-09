'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { MensajeChat } from '@/types';
import { Aviso } from './Aviso';

// Conversación (la usan el cliente y el proveedor). Se actualiza sola cada 8 segundos.
export function Chat({ yo, cargar, enviar }: { yo: 'cliente' | 'negocio'; cargar: () => Promise<MensajeChat[]>; enviar: (texto: string) => Promise<MensajeChat> }) {
  const [msgs, setMsgs] = useState<MensajeChat[] | null>(null);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);

  const refrescar = useCallback(() => cargar().then(setMsgs).catch((e: Error) => setError(e.message)), [cargar]);
  useEffect(() => {
    refrescar();
    const id = setInterval(refrescar, 8000);
    return () => clearInterval(id);
  }, [refrescar]);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }); }, [msgs?.length]);

  async function mandar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setError('');
    try {
      const m = await enviar(texto.trim());
      setMsgs((l) => [...(l ?? []), m]);
      setTexto('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="chat">
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <div className="chat__lista" aria-live="polite">
        {msgs?.length === 0 && <p className="pantalla-nota texto-centrado">Aún no hay mensajes. Escribe el primero.</p>}
        {msgs?.map((m) => (
          <div key={m.id} className={`burbuja${m.de === yo ? ' burbuja--mia' : ''}`}>
            <p>{m.texto}</p>
            <small>{new Date(m.creadoEn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</small>
          </div>
        ))}
        <div ref={fin} />
      </div>
      <form className="chat__form" onSubmit={mandar}>
        <input value={texto} maxLength={1000} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un mensaje" aria-label="Mensaje" />
        <button type="submit" disabled={enviando || !texto.trim()}>Enviar</button>
      </form>
    </div>
  );
}

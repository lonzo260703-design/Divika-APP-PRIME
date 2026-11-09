'use client';

import { ListaConversaciones } from '@/components/portal/ListaConversaciones';
import { useEscritorio } from '@/lib/useEscritorio';

export default function Mensajes() {
  const escritorio = useEscritorio() === true;
  return (
    <div className={escritorio ? 'p-ancho' : 'p-estrecho'}>
      <h1 className="p-titulo">Mensajes</h1>
      <p className="p-sub">Conversaciones directas con tus clientes, con el contexto de cada solicitud.</p>
      <div className="p-maestro">
        <ListaConversaciones />
        {escritorio && <div className="p-tarjeta"><p className="p-sub">Elige una conversación para verla aquí.</p></div>}
      </div>
    </div>
  );
}

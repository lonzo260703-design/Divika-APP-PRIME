'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconCalendar } from '@/components/ui/icons';
import { cancelarReserva, fechaLarga, leerReservas, type ReservaDemo } from '@/lib/reservas';

export default function ReservacionesPage() {
  const [lista, setLista] = useState<ReservaDemo[] | null>(null);
  useEffect(() => setLista(leerReservas()), []);

  function cancelar(id: string) {
    cancelarReserva(id);
    setLista(leerReservas());
  }

  return (
    <>
      <div className="cabecera"><h1 className="titulo">Reservaciones</h1></div>
      {lista && lista.length === 0 && (
        <div className="fav-vacio">
          <span className="fav-vacio__icono"><IconCalendar /></span>
          <h2>Aún no tienes reservaciones</h2>
          <p>Entra a un negocio y toca “Ver fechas” para reservar.</p>
          <Link href="/home" className="enlace-boton">Explorar negocios</Link>
        </div>
      )}
      {lista && lista.length > 0 && <p className="nota-gris">Demo: estas reservaciones solo existen en este navegador.</p>}
      {lista?.map((r) => (
        <div key={r.id} className="tarjeta-pago">
          <div className="tarjeta-pago__cab">
            <Link href={`/negocio/${r.negocioId}`}>{r.negocio}</Link>
            <span className="etiqueta-chica">{r.estado === 'confirmada' ? 'Confirmada' : 'Cancelada'}</span>
          </div>
          <small>{fechaLarga(r.fecha)} · {r.hora} h · {r.personas} {r.personas === 1 ? 'persona' : 'personas'} · Folio {r.id}</small>
          {r.estado === 'confirmada' && (
            <button type="button" className="enlace-boton enlace-boton--rojo" onClick={() => cancelar(r.id)}>Cancelar reservación</button>
          )}
        </div>
      ))}
    </>
  );
}

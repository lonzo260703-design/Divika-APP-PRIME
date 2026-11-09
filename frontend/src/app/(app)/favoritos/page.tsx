'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { IconHeartFill, IconPin } from '@/components/ui/icons';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useFavoritos } from '@/lib/useFavoritos';
import type { Negocio } from '@/types';

export default function FavoritosPage() {
  const router = useRouter();
  const { lista, agregar, quitar, error, setError } = useFavoritos();
  const [top, setTop] = useState<Negocio[]>([]);
  const [eliminado, setEliminado] = useState<Negocio | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    api<Negocio[]>('/negocios/top').then(setTop).catch(() => setTop([]));
  }, []);

  function quitarConAviso(n: Negocio) {
    quitar(n.id);
    setEliminado(n);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEliminado(null), 4000);
  }
  function deshacer() {
    if (eliminado) agregar(eliminado);
    setEliminado(null);
  }

  const tarjeta = (n: Negocio, conCorazon: boolean) => (
    <div key={n.id} className="fav-card">
      <button type="button" className="pressable" onClick={() => router.push(`/negocio/${n.id}`)}>
        <Card variant="grid">
          <Card.Image src={n.imagenUrl ?? undefined} alt={n.nombre} />
          <Card.Content>
            <div className="card__meta">
              <span className="chip-mini">{n.subcategoria ?? n.categoria}</span>
              <span className="card__calif">★ {n.calificacion.toFixed(1)}</span>
            </div>
            <Card.Title>{n.nombre}</Card.Title>
            {n.distanciaKm != null && <Card.Subtitle className="card__distancia"><IconPin /> {n.distanciaKm.toFixed(1)} km</Card.Subtitle>}
          </Card.Content>
        </Card>
      </button>
      {conCorazon && (
        <button type="button" className="fav-card__corazon" aria-label={`Quitar ${n.nombre} de favoritos`} onClick={() => quitarConAviso(n)}>
          <IconHeartFill />
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="cabecera"><h1 className="titulo">Favoritos</h1></div>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}

      {lista && lista.length > 0 && <div className="resultados">{lista.map((n) => tarjeta(n, true))}</div>}

      {lista && lista.length === 0 && (
        <>
          <div className="fav-vacio">
            <span className="fav-vacio__icono"><IconHeartFill /></span>
            <h2>Aún no tienes favoritos</h2>
            <p>Toca el corazón en un negocio para guardarlo aquí.</p>
          </div>
          {top.length > 0 && (
            <>
              <h2 className="seccion-titulo">Los mejor calificados para ti</h2>
              <div className="resultados">{top.slice(0, 6).map((n) => tarjeta(n, false))}</div>
            </>
          )}
        </>
      )}

      {eliminado && (
        <div className="toast toast--accion" role="status">
          <span>Quitaste {eliminado.nombre} de favoritos</span>
          <button type="button" onClick={deshacer}>Deshacer</button>
        </div>
      )}
    </>
  );
}

import type { Negocio } from '@/types';
import { Card } from '../ui/Card';
import { IconPin } from '../ui/icons';

// Card compacta del listado por categoría: foto, subcategoría, calificación, nombre y distancia
export function NegocioGridCard({ negocio, onPress }: { negocio: Negocio; onPress?: () => void }) {
  return (
    <button type="button" className="pressable" onClick={onPress}>
      <Card variant="grid">
        <Card.Image src={negocio.imagenUrl ?? undefined} alt={negocio.nombre} />
        <Card.Content>
          <div className="card__meta">
            <span className="chip-mini">{negocio.subcategoria ?? negocio.categoria}</span>
            <span className="card__calif">★ {negocio.calificacion.toFixed(1)}</span>
          </div>
          <Card.Title>{negocio.nombre}</Card.Title>
          {negocio.distanciaKm != null && (
            <Card.Subtitle className="card__distancia">
              <IconPin /> {negocio.distanciaKm.toFixed(1)} km
            </Card.Subtitle>
          )}
        </Card.Content>
      </Card>
    </button>
  );
}

import type { Negocio } from '@/types';
import { Card } from '../ui/Card';

// Card de "Cerca de ti": imagen arriba, nombre y calificación abajo
export function NegocioCard({ negocio, onPress }: { negocio: Negocio; onPress?: () => void }) {
  return (
    <button type="button" className="pressable" onClick={onPress}>
      <Card variant="stack">
        <Card.Image src={negocio.imagenUrl ?? undefined} alt={negocio.nombre} />
        <Card.Content>
          <Card.Title>{negocio.nombre}</Card.Title>
          <Card.Subtitle>★ {negocio.calificacion.toFixed(1)}</Card.Subtitle>
        </Card.Content>
      </Card>
    </button>
  );
}

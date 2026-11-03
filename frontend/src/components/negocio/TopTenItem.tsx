import { Card } from '../ui/Card';

type Props = {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  position: number;
  onPress?: () => void;
};

// Equivalente web de TopTenPlaceItem (Pressable → button)
export function TopTenItem({ imageUrl, title, subtitle, position, onPress }: Props) {
  return (
    <button type="button" className="pressable" onClick={onPress}>
      <Card variant="overlay">
        <Card.Image src={imageUrl} alt={title} />
        <Card.Overlay />
        <Card.Badge number={position} />
        <Card.Content>
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle>{subtitle}</Card.Subtitle>
        </Card.Content>
      </Card>
    </button>
  );
}

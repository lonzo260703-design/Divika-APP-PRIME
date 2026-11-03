// Espacio para el banner de promociones. Más adelante puede venir de la base de datos.
export function PromoBanner({ texto = 'Aquí va tu promoción' }: { texto?: string }) {
  return <div className="promo">{texto}</div>;
}

// Mantener sincronizado con backend/src/negocios/categorias.ts
// Los iconos son emojis para no depender de librerías: cámbialos por SVG o lucide-react cuando quieras.
export const CATEGORIAS = [
  { slug: 'bienestar', nombre: 'Bienestar', icono: '🌿' },
  { slug: 'fitness', nombre: 'Fitness', icono: '🏋️' },
  { slug: 'autos', nombre: 'Autos', icono: '🚗' },
  { slug: 'hogar', nombre: 'Hogar', icono: '🏠' },
  { slug: 'estetica', nombre: 'Estética', icono: '✂️' },
  { slug: 'laboratorios', nombre: 'Laboratorios', icono: '🧪' },
  { slug: 'tecnologia', nombre: 'Tecnología', icono: '📱' },
  { slug: 'alimentos', nombre: 'Alimentos', icono: '🍎' },
] as const;

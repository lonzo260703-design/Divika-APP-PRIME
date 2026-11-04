// Mantener sincronizado con backend/src/negocios/categorias.ts
// El orden es el de la pantalla (dos filas, se llenan por columnas). Los iconos de línea están en components/home/categoriaIconos.tsx
export const CATEGORIAS = [
  { slug: 'alimentos', nombre: 'Restaurantes', icono: '🍎' },
  { slug: 'hogar', nombre: 'Servicios para el hogar', icono: '🏠' },
  { slug: 'bienestar', nombre: 'Bienestar', icono: '🌿' },
  { slug: 'fitness', nombre: 'Fitness', icono: '🏋️' },
  { slug: 'autos', nombre: 'Autos', icono: '🚗' },
  { slug: 'estetica', nombre: 'Estética', icono: '✂️' },
  { slug: 'laboratorios', nombre: 'Laboratorios', icono: '🧪' },
  { slug: 'tecnologia', nombre: 'Tecnología', icono: '📱' },
] as const;

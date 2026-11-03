// Mantener sincronizado con frontend/src/lib/categorias.ts
export const CATEGORIAS = [
  'bienestar',
  'fitness',
  'autos',
  'hogar',
  'estetica',
  'laboratorios',
  'tecnologia',
  'alimentos',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

// FUENTE ÚNICA de categorías y subcategorías. El frontend las lee de GET /categorias,
// así que para agregar o renombrar una solo se cambia aquí (el icono sí va en el frontend,
// en components/home/categoriaIconos.tsx, por slug).
export const CATALOGO = [
  { slug: 'restaurantes', nombre: 'Restaurantes', subcategorias: ['Mexicana', 'Italiana', 'Japonesa', 'Saludable'] },
  { slug: 'salud', nombre: 'Salud', subcategorias: ['Pediatría', 'Dental', 'Psicología', 'Cardiología', 'Urología'] },
  { slug: 'hogar', nombre: 'Servicios para el hogar', subcategorias: ['Plomería', 'Carpintería', 'Cerrajería', 'Albañilería'] },
  { slug: 'cafeterias', nombre: 'Cafeterías', subcategorias: ['Especialidad', 'Panadería', 'Vegano', 'Desayunos'] },
  { slug: 'tecnologia', nombre: 'Tecnología', subcategorias: ['Celulares', 'Cómputo', 'Accesorios'] },
  { slug: 'belleza', nombre: 'Belleza', subcategorias: ['Spa', 'Manicure', 'Lash', 'Maquillaje'] },
  { slug: 'automotriz', nombre: 'Servicio automotriz', subcategorias: ['Mecánica', 'Llantas', 'Lavado'] },
  { slug: 'entretenimiento', nombre: 'Entretenimiento', subcategorias: ['Cines', 'Bares & antros', 'Juegos & ocio', 'Culturales'] },
  { slug: 'mascotas', nombre: 'Mascotas', subcategorias: ['Veterinarias', 'Veterinarias de exóticos', 'Estética'] },
  { slug: 'limpieza', nombre: 'Servicio de limpieza', subcategorias: ['Hogar & depas', 'Oficinas & locales', 'Salas & alfombras', 'Línea blanca'] },
  { slug: 'estetica', nombre: 'Estética', subcategorias: ['Cabello & color', 'Barberías'] },
  { slug: 'ropa', nombre: 'Ropa', subcategorias: ['Mujer', 'Hombre', 'Infantil', 'Deporte & fitness'] },
] as const;

export const CATEGORIAS: string[] = CATALOGO.map((c) => c.slug);

export type Categoria = (typeof CATALOGO)[number]['slug'];

export function subcategoriasDe(slug: string): readonly string[] {
  return CATALOGO.find((c) => c.slug === slug)?.subcategorias ?? [];
}

// Sin subcategoría (vacía) también es válido
export const subcategoriaValida = (categoria: string, subcategoria?: string | null) =>
  !subcategoria || subcategoriasDe(categoria).includes(subcategoria);

// Categorías de la primera versión → equivalentes actuales (para bases de datos ya creadas)
export const CATEGORIAS_ANTERIORES: Record<string, string> = {
  alimentos: 'restaurantes',
  autos: 'automotriz',
  laboratorios: 'salud',
  bienestar: 'belleza',
  fitness: 'entretenimiento',
};

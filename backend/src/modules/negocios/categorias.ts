// Catálogo inicial de categorías y subcategorías. Al arrancar, las que falten se agregan a la tabla
// categories (base/categorias.service.ts) y el front las lee de GET /categorias. El icono va en el
// frontend (components/home/categoriaIconos.tsx, por slug).
export const CATALOGO = [
  { slug: 'restaurantes', nombre: 'Restaurantes', subcategorias: ['Mexicana', 'Internacional', 'Taquerías', 'Italiana'] },
  { slug: 'salud', nombre: 'Salud', subcategorias: ['Medicina general', 'Dental', 'Ópticas', 'Fisioterapia'] },
  { slug: 'hogar', nombre: 'Servicios para el hogar', subcategorias: ['Carpintería', 'Plomería', 'Limpieza', 'Electricidad'] },
  { slug: 'cafeterias', nombre: 'Cafeterías', subcategorias: ['Especialidad', 'Panadería', 'Clásicas', 'Tostadores'] },
  { slug: 'tecnologia', nombre: 'Tecnología', subcategorias: ['Celulares', 'Computadoras', 'Conectividad', 'Soporte técnico'] },
  { slug: 'belleza', nombre: 'Belleza', subcategorias: ['Salones', 'Barberías', 'Uñas', 'Spa'] },
  { slug: 'automotriz', nombre: 'Servicio automotriz', subcategorias: ['Mecánica', 'Llantas', 'Autolavado', 'Hojalatería'] },
  { slug: 'entretenimiento', nombre: 'Entretenimiento', subcategorias: ['Cine', 'Boliche', 'Juegos', 'Espectáculos'] },
  { slug: 'mascotas', nombre: 'Mascotas', subcategorias: ['Veterinarias', 'Veterinarias de exóticos', 'Estética'] },
  { slug: 'limpieza', nombre: 'Servicio de limpieza', subcategorias: ['Hogar y depas', 'Oficinas y locales', 'Salas y alfombras', 'Línea blanca y cocina'] },
  { slug: 'estetica', nombre: 'Estética', subcategorias: ['Cabello y color', 'Barberías'] },
  { slug: 'ropa', nombre: 'Ropa', subcategorias: ['Mujer', 'Hombre', 'Infantil', 'Deporte y fitness'] },
] as const;

export const CATEGORIAS: string[] = CATALOGO.map((c) => c.slug);

export type Categoria = (typeof CATALOGO)[number]['slug'];

export function subcategoriasDe(slug: string): readonly string[] {
  return CATALOGO.find((c) => c.slug === slug)?.subcategorias ?? [];
}

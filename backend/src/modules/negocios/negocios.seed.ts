// Datos de ejemplo (basados en las pantallas del diseño) para probar la app. Se cargan solo cuando la tabla está vacía.
// [nombre, categoría, subcategoría, calificación, distancia en km desde el centro de Durango]
export const NEGOCIOS_EJEMPLO: [string, string, string, number, number][] = [
  ['Yasuko', 'restaurantes', 'Japonesa', 4.8, 0.4],
  ['Trattoria Olivo', 'restaurantes', 'Italiana', 4.7, 0.8],
  ['Tacos Don Luis', 'restaurantes', 'Mexicana', 4.6, 1.2],
  ['Verde Limón', 'restaurantes', 'Saludable', 4.5, 1.6],

  ['Dr. Yoel Martínez', 'salud', 'Urología', 4.8, 0.4],
  ['Dra. Mariela Pérez', 'salud', 'Pediatría', 4.7, 0.8],
  ['Daniela Robles', 'salud', 'Psicología', 4.6, 1.2],
  ['Dr. Manuel Jiménez', 'salud', 'Cardiología', 4.9, 1.6],

  ['Don José', 'hogar', 'Plomería', 4.8, 0.4],
  ['Mariano Segovia', 'hogar', 'Carpintería', 4.7, 0.8],
  ['Alfonso Camil', 'hogar', 'Albañilería', 4.6, 1.2],
  ['Laura Flores', 'hogar', 'Plomería', 4.9, 1.6],

  ['La Paz', 'cafeterias', 'Panadería', 4.8, 0.4],
  ['Sin vaquitas', 'cafeterias', 'Vegano', 4.7, 0.8],
  ['Brunė', 'cafeterias', 'Especialidad', 4.6, 1.2],
  ['Plauchu', 'cafeterias', 'Desayunos', 4.9, 1.6],

  ['Jescel', 'tecnologia', 'Celulares', 4.8, 0.4],
  ['Repa Cel', 'tecnologia', 'Celulares', 4.7, 0.8],
  ['Todocompu', 'tecnologia', 'Cómputo', 4.6, 1.2],
  ['Todoparacel', 'tecnologia', 'Accesorios', 4.9, 1.6],

  ['Luna Studio', 'belleza', 'Maquillaje', 4.8, 0.4],
  ['Alma Nails', 'belleza', 'Manicure', 4.7, 0.8],
  ['Aura Bienestar', 'belleza', 'Spa', 4.6, 1.2],
  ['Miranda Eyes', 'belleza', 'Lash', 4.9, 1.6],

  ['Don José Autolavado', 'automotriz', 'Lavado', 4.8, 0.4],
  ['Mariano Segovia Mecánica', 'automotriz', 'Mecánica', 4.7, 0.8],
  ['Alfonso Camil Llantas', 'automotriz', 'Llantas', 4.6, 1.2],
  ['Laura Flores Autolavado', 'automotriz', 'Lavado', 4.9, 1.6],

  ['Cinemex', 'entretenimiento', 'Cines', 4.8, 0.4],
  ['Monkys', 'entretenimiento', 'Bares & antros', 4.7, 0.8],
  ['Cinépolis', 'entretenimiento', 'Cines', 4.6, 1.2],
  ['Belichendo', 'entretenimiento', 'Juegos & ocio', 4.9, 1.6],

  ['NaVet', 'mascotas', 'Veterinarias', 4.8, 0.4],
  ['Mundo Animal', 'mascotas', 'Veterinarias', 4.7, 0.8],
  ['Aura Pet Spa', 'mascotas', 'Estética', 4.6, 1.2],
  ['La Vaquita Exóticos', 'mascotas', 'Veterinarias de exóticos', 4.9, 1.6],

  ['Marcela López', 'limpieza', 'Hogar & depas', 4.8, 0.4],
  ['CleanMex', 'limpieza', 'Oficinas & locales', 4.7, 0.8],
  ['Oxaclean', 'limpieza', 'Salas & alfombras', 4.6, 1.2],
  ['Semav', 'limpieza', 'Línea blanca', 4.9, 1.6],

  ['Bigote Rojo', 'estetica', 'Barberías', 4.8, 0.4],
  ['Alma Studio', 'estetica', 'Cabello & color', 4.7, 0.8],
  ['Aura Studio', 'estetica', 'Cabello & color', 4.6, 1.2],
  ['Deroteo', 'estetica', 'Barberías', 4.9, 1.6],

  ['Cuidado con el Perro', 'ropa', 'Mujer', 4.8, 0.4],
  ['Mila Kids', 'ropa', 'Infantil', 4.7, 0.8],
  ['Sport and Cool', 'ropa', 'Deporte & fitness', 4.6, 1.2],
  ['Cuidado con el Perro Hombre', 'ropa', 'Hombre', 4.9, 1.6],
];

// Centro de Durango: de aquí salen las coordenadas de ejemplo
export const CENTRO = { lat: 24.0277, lng: -104.6532 };

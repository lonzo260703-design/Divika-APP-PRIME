// Negocios de ejemplo tomados del diseño en Figma (nombres, fotos, subcategorías y descripciones).
// Se cargan cuando la base no tiene negocios, o reemplazan a los ejemplos anteriores (source = 'precargado').
// Calificación en 0 y sin reseñas: solo se califican con opiniones reales.
// colonia null = "ubicación por confirmar" y sin horario (en el diseño dicen "Consultar horario").
export type NegocioEjemplo = { nombre: string; slug: string; categoria: string; subcategoria: string; descripcion: string | null; km: number; colonia: string | null };

export const NEGOCIOS_EJEMPLO: NegocioEjemplo[] = [
  { nombre: 'La Mesa de Ana', slug: 'la-mesa-de-ana', categoria: 'restaurantes', subcategoria: 'Mexicana', descripcion: 'Cocina de casa, ingredientes frescos y tradición mexicana.', km: 0.8, colonia: 'Centro' },
  { nombre: 'El Rincón de Mina', slug: 'el-rincon-de-mina', categoria: 'restaurantes', subcategoria: 'Internacional', descripcion: 'Sabores del mundo en un espacio para compartir.', km: 1.2, colonia: 'Guillermina' },
  { nombre: 'Tacos Don Luis', slug: 'tacos-don-luis', categoria: 'restaurantes', subcategoria: 'Taquerías', descripcion: 'Tacos al pastor, salsas de la casa y tortillas recién hechas.', km: 0.6, colonia: 'Los Ángeles' },
  { nombre: 'Pasta Bonita', slug: 'pasta-bonita', categoria: 'restaurantes', subcategoria: 'Italiana', descripcion: 'Pasta artesanal y recetas italianas preparadas al momento.', km: 1.8, colonia: 'Nueva Vizcaya' },
  { nombre: 'Mi ranchito', slug: 'mi-ranchito', categoria: 'restaurantes', subcategoria: 'Mexicana', descripcion: null, km: 1.4, colonia: 'Jardines de Durango' },

  { nombre: 'Clínica del Valle', slug: 'clinica-del-valle', categoria: 'salud', subcategoria: 'Medicina general', descripcion: 'Consulta general y atención cercana para toda la familia.', km: 1.1, colonia: 'Nueva Vizcaya' },
  { nombre: 'Dental Sonrisa', slug: 'dental-sonrisa', categoria: 'salud', subcategoria: 'Dental', descripcion: 'Limpieza, prevención y cuidado integral de tu sonrisa.', km: 0.9, colonia: 'Jardines de Durango' },
  { nombre: 'Óptica Visión', slug: 'optica-vision', categoria: 'salud', subcategoria: 'Ópticas', descripcion: 'Examen de la vista y armazones para cada estilo.', km: 1.4, colonia: 'Centro' },
  { nombre: 'FisioEquilibrio', slug: 'fisioequilibrio', categoria: 'salud', subcategoria: 'Fisioterapia', descripcion: 'Rehabilitación y movimiento con atención personalizada.', km: 1.6, colonia: 'Guillermina' },

  { nombre: 'Carpintería Roble', slug: 'carpinteria-roble', categoria: 'hogar', subcategoria: 'Carpintería', descripcion: 'Muebles a medida, reparaciones y acabados en madera.', km: 1.5, colonia: 'Jalisco' },
  { nombre: 'Plomería Flores', slug: 'plomeria-flores', categoria: 'hogar', subcategoria: 'Plomería', descripcion: 'Reparación de fugas e instalaciones con visita a domicilio.', km: 0.9, colonia: 'Jardines de Durango' },
  { nombre: 'Hogar Reluciente', slug: 'hogar-reluciente', categoria: 'hogar', subcategoria: 'Limpieza', descripcion: 'Limpieza profunda y mantenimiento de tus espacios.', km: 2.0, colonia: 'Nueva Vizcaya' },
  { nombre: 'Eléctrica Torres', slug: 'electrica-torres', categoria: 'hogar', subcategoria: 'Electricidad', descripcion: 'Instalaciones, mantenimiento y soluciones eléctricas.', km: 1.2, colonia: 'Los Ángeles' },
  { nombre: 'Don Pepe', slug: 'don-pepe', categoria: 'hogar', subcategoria: 'Carpintería', descripcion: null, km: 1.0, colonia: 'Centro' },
  { nombre: 'Sergio', slug: 'sergio', categoria: 'hogar', subcategoria: 'Electricidad', descripcion: null, km: 1.3, colonia: 'Jalisco' },

  { nombre: 'Café Magnolia', slug: 'cafe-magnolia', categoria: 'cafeterias', subcategoria: 'Especialidad', descripcion: 'Café de origen y un rincón tranquilo para tu día.', km: 0.5, colonia: 'Centro' },
  { nombre: 'Fika y Grano', slug: 'fika-y-grano', categoria: 'cafeterias', subcategoria: 'Panadería', descripcion: 'Pan recién horneado y café para acompañar cada antojo.', km: 0.8, colonia: 'Guillermina' },
  { nombre: 'La Esquina Café', slug: 'la-esquina-cafe', categoria: 'cafeterias', subcategoria: 'Clásicas', descripcion: 'Desayunos, café de olla y conversaciones sin prisa.', km: 1.0, colonia: 'Hipódromo' },
  { nombre: 'Origen Tostador', slug: 'origen-tostador', categoria: 'cafeterias', subcategoria: 'Tostadores', descripcion: 'Granos mexicanos, tueste local y métodos de extracción.', km: 1.3, colonia: 'Los Ángeles' },

  { nombre: 'Juan Mecánico', slug: 'juan-mecanico', categoria: 'automotriz', subcategoria: 'Mecánica', descripcion: 'Diagnóstico, afinación y mantenimiento para tu auto.', km: 1.2, colonia: 'Silvestre Dorador' },
  { nombre: 'Servicio del Sur', slug: 'servicio-del-sur', categoria: 'automotriz', subcategoria: 'Llantas', descripcion: 'Cambio de llantas, alineación y balanceo profesional.', km: 0.9, colonia: 'Jalisco' },
  { nombre: 'AutoSpa Brillo', slug: 'autospa-brillo', categoria: 'automotriz', subcategoria: 'Autolavado', descripcion: 'Lavado a detalle y cuidado de interiores y carrocería.', km: 1.5, colonia: 'Jardines de Durango' },
  { nombre: 'Taller Buenavista', slug: 'taller-buenavista', categoria: 'automotriz', subcategoria: 'Hojalatería', descripcion: 'Reparación de carrocería y pintura con atención al detalle.', km: 2.0, colonia: 'Benito Juárez' },

  { nombre: 'Tecno Solución', slug: 'tecno-solucion', categoria: 'tecnologia', subcategoria: 'Celulares', descripcion: 'Reparación de pantallas, baterías y diagnóstico de equipos.', km: 0.7, colonia: 'Centro' },
  { nombre: 'Compu Centro', slug: 'compu-centro', categoria: 'tecnologia', subcategoria: 'Computadoras', descripcion: 'Mantenimiento y reparación para que tu equipo siga contigo.', km: 1.1, colonia: 'Centro' },
  { nombre: 'Conecta Redes', slug: 'conecta-redes', categoria: 'tecnologia', subcategoria: 'Conectividad', descripcion: 'Instalación de redes y Wi-Fi para tu casa o negocio.', km: 1.4, colonia: 'Jardines de Durango' },
  { nombre: 'Digital Express', slug: 'digital-express', categoria: 'tecnologia', subcategoria: 'Soporte técnico', descripcion: 'Configuración, asesoría y ayuda con tus dispositivos.', km: 0.9, colonia: 'Nueva Vizcaya' },

  { nombre: 'Estética Violeta', slug: 'estetica-violeta', categoria: 'belleza', subcategoria: 'Salones', descripcion: 'Cortes, color y peinados que van contigo y tu estilo.', km: 0.8, colonia: 'Centro' },
  { nombre: 'Barbería Central', slug: 'barberia-central', categoria: 'belleza', subcategoria: 'Barberías', descripcion: 'Corte clásico, diseño de barba y atención personalizada.', km: 1.1, colonia: 'Guillermina' },
  { nombre: 'Alma Nails', slug: 'alma-nails', categoria: 'belleza', subcategoria: 'Uñas', descripcion: 'Manicure, pedicure y diseños para cada ocasión.', km: 0.6, colonia: 'Jardines de Durango' },
  { nombre: 'Aura Bienestar', slug: 'aura-bienestar', categoria: 'belleza', subcategoria: 'Spa', descripcion: 'Masajes y tratamientos para regalarte una pausa.', km: 1.5, colonia: 'Nueva Vizcaya' },
  { nombre: 'Brenda', slug: 'brenda', categoria: 'belleza', subcategoria: 'Salones', descripcion: null, km: 0.7, colonia: 'Hipódromo' },
  { nombre: 'Alejandra', slug: 'alejandra', categoria: 'belleza', subcategoria: 'Salones', descripcion: null, km: 1.2, colonia: 'Los Ángeles' },

  { nombre: 'Cine Avenida', slug: 'cine-avenida', categoria: 'entretenimiento', subcategoria: 'Cine', descripcion: 'Grandes historias y funciones para todos los gustos.', km: 1.8, colonia: 'Los Ángeles' },
  { nombre: 'Bolera Insurgentes', slug: 'bolera-insurgentes', categoria: 'entretenimiento', subcategoria: 'Boliche', descripcion: 'Una partida entre amigos y diversión para toda la familia.', km: 2.1, colonia: 'Nueva Vizcaya' },
  { nombre: 'El Rincón del Juego', slug: 'el-rincon-del-juego', categoria: 'entretenimiento', subcategoria: 'Juegos', descripcion: 'Juegos de mesa, retos y tardes para compartir.', km: 0.9, colonia: 'Guillermina' },
  { nombre: 'Escena Encendida', slug: 'escena-encendida', categoria: 'entretenimiento', subcategoria: 'Espectáculos', descripcion: 'Teatro y música en vivo en un espacio lleno de historias.', km: 1.6, colonia: 'Centro' },

  { nombre: 'NaVet', slug: 'navet', categoria: 'mascotas', subcategoria: 'Veterinarias', descripcion: 'Atención veterinaria para el bienestar de tu mascota.', km: 0.4, colonia: null },
  { nombre: 'Mundo animal', slug: 'mundo-animal', categoria: 'mascotas', subcategoria: 'Veterinarias de exóticos', descripcion: 'Cuidado especializado para mascotas exóticas.', km: 0.8, colonia: null },
  { nombre: 'Aura Bienestar', slug: 'aura-bienestar-mascotas', categoria: 'mascotas', subcategoria: 'Estética', descripcion: 'Servicios de estética y cuidado para tu mascota.', km: 1.2, colonia: null },
  { nombre: 'La vaquita', slug: 'la-vaquita', categoria: 'mascotas', subcategoria: 'Veterinarias', descripcion: 'Consulta veterinaria y orientación para sus cuidados.', km: 1.6, colonia: null },

  { nombre: 'Marcela López', slug: 'marcela-lopez', categoria: 'limpieza', subcategoria: 'Hogar y depas', descripcion: 'Limpieza para casas y departamentos.', km: 0.4, colonia: null },
  { nombre: 'CleanMex', slug: 'cleanmex', categoria: 'limpieza', subcategoria: 'Oficinas y locales', descripcion: 'Cuida la limpieza de tu oficina o local.', km: 0.8, colonia: null },
  { nombre: 'Oxaclean', slug: 'oxaclean', categoria: 'limpieza', subcategoria: 'Salas y alfombras', descripcion: 'Limpieza de tapicería, salas y alfombras.', km: 1.2, colonia: null },
  { nombre: 'Semav', slug: 'semav', categoria: 'limpieza', subcategoria: 'Línea blanca y cocina', descripcion: 'Limpieza de cocina y equipos del hogar.', km: 1.6, colonia: null },

  { nombre: 'Bigote rojo', slug: 'bigote-rojo', categoria: 'estetica', subcategoria: 'Barberías', descripcion: 'Corte y cuidado de barba a tu estilo.', km: 0.4, colonia: null },
  { nombre: 'Alma studio', slug: 'alma-studio', categoria: 'estetica', subcategoria: 'Cabello y color', descripcion: 'Servicios de cabello y color personalizados.', km: 0.8, colonia: null },
  { nombre: 'Aura studio', slug: 'aura-studio', categoria: 'estetica', subcategoria: 'Cabello y color', descripcion: 'Un espacio para renovar tu corte y color.', km: 1.2, colonia: null },
  { nombre: 'Doroteo', slug: 'doroteo', categoria: 'estetica', subcategoria: 'Barberías', descripcion: 'Barbería y cuidado personal cerca de ti.', km: 1.6, colonia: null },

  { nombre: 'Cuidado con el perro', slug: 'cuidado-con-el-perro', categoria: 'ropa', subcategoria: 'Mujer', descripcion: 'Prendas para expresar tu estilo cada día.', km: 0.4, colonia: null },
  { nombre: 'Mila Kids', slug: 'mila-kids', categoria: 'ropa', subcategoria: 'Infantil', descripcion: 'Ropa infantil para acompañar su crecimiento.', km: 0.8, colonia: null },
  { nombre: 'Sport and cool', slug: 'sport-and-cool', categoria: 'ropa', subcategoria: 'Deporte y fitness', descripcion: 'Ropa deportiva y prendas para entrenar.', km: 1.2, colonia: null },
  { nombre: 'Cuidado con el perro', slug: 'cuidado-con-el-perro-hombre', categoria: 'ropa', subcategoria: 'Hombre', descripcion: 'Encuentra prendas y básicos para hombre.', km: 1.6, colonia: null },
];

// Centro de Durango: de aquí salen las coordenadas de ejemplo
export const CENTRO = { lat: 24.0277, lng: -104.6532 };

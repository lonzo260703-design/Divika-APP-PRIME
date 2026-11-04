export type Rol = 'cliente' | 'negocio';

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string | null;
  telefonoVerificado?: boolean;
};

export type Sesion = { token: string; usuario: Usuario };

export type HorarioDia = { apertura: string; cierre: string; cerrado: boolean };

export type Negocio = {
  id: number;
  nombre: string;
  descripcionCorta: string | null;
  categoria: string;
  subcategoria: string | null;
  telefono: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  horario: string | null;
  horariosJson: Record<string, HorarioDia> | null;
  calificacion: number;
  imagenUrl: string | null;
  galeria: string[] | null;
  clicsWhatsapp: number;
  clicsLlamada: number;
  creadoEn: string;
  // Solo viene en GET /negocios (null si no se mandó la ubicación)
  distanciaKm?: number | null;
};

// GET /categorias
export type CategoriaInfo = { slug: string; nombre: string; subcategorias: string[] };

// GET /negocios/cercanos
export type NegocioCercano = Negocio & { distanciaKm: number | null };

// GET /negocios/:id (incluye datos públicos del dueño)
export type NegocioDetalle = Negocio & { owner: { id: number; nombre: string } | null };

export type Resena = {
  id: number;
  calificacion: number; // 1 a 5
  comentario: string | null;
  creadoEn: string;
  usuario: { id: number; nombre: string };
};

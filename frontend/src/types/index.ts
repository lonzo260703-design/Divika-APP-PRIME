export type Rol = 'cliente' | 'negocio';

export type Usuario = { id: number; nombre: string; email: string; rol: Rol };

export type Sesion = { token: string; usuario: Usuario };

export type Negocio = {
  id: number;
  nombre: string;
  categoria: string;
  telefono: string;
  direccion: string;
  horario: string | null;
  calificacion: number;
  imagenUrl: string | null;
};

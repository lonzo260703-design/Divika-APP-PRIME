import type { ReactNode } from 'react';

// Iconos de línea (estilo del diseño), uno por categoría. La clave es el slug que manda GET /categorias.
function Linea({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export const ICONOS_CATEGORIA: Record<string, ReactNode> = {
  restaurantes: <Linea><path d="M14 6v14a4 4 0 0 0 4 4v18M10 6v10M18 6v10M34 42V6c-5 2-7 8-7 16h7" /></Linea>,
  salud: <Linea><circle cx="24" cy="24" r="18" /><path d="M24 14v20M14 24h20" /></Linea>,
  hogar: <Linea><path d="M5 22 24 6l19 16M9 20v22h30V20M20 42V30h8v12" /></Linea>,
  cafeterias: <Linea><path d="M8 22h26v8a10 10 0 0 1-10 10h-6A10 10 0 0 1 8 30v-8zM34 25h3a4 4 0 0 1 0 8h-4M16 8c-2 3 2 5 0 8M24 8c-2 3 2 5 0 8" /></Linea>,
  tecnologia: <Linea><rect x="14" y="4" width="20" height="40" rx="4" /><path d="M21 38h6" /></Linea>,
  belleza: <Linea><path d="M22 6l4 12 12 4-12 4-4 12-4-12-12-4 12-4zM38 6v8M34 10h8" /></Linea>,
  automotriz: <Linea><path d="M8 32V22l5-12h22l5 12v10M4 32h40M12 32v6M36 32v6" /><circle cx="14" cy="26" r="1.5" /><circle cx="34" cy="26" r="1.5" /></Linea>,
  entretenimiento: <Linea><rect x="6" y="10" width="36" height="28" rx="3" /><path d="M14 10v28M34 10v28M6 18h8M6 24h8M6 30h8M34 18h8M34 24h8M34 30h8" /></Linea>,
  mascotas: <Linea><circle cx="11" cy="22" r="3.5" /><circle cx="19" cy="12" r="3.5" /><circle cx="29" cy="12" r="3.5" /><circle cx="37" cy="22" r="3.5" /><path d="M24 25c-7 0-12 7-12 12 0 4 4 5 12 5s12-1 12-5c0-5-5-12-12-12z" /></Linea>,
  limpieza: <Linea><path d="M18 20h12v22H18zM20 20v-6h8v6M28 14h8l4-4M42 18h-2M42 24h-3" /></Linea>,
  estetica: <Linea><circle cx="12" cy="12" r="5" /><circle cx="12" cy="36" r="5" /><path d="M16 16 42 38M16 32 42 10" /></Linea>,
  ropa: <Linea><path d="M16 6 6 14l5 7 5-3v22h16V18l5 3 5-7-10-8c-1 4-4 6-8 6s-7-2-8-6z" /></Linea>,
};

export const ICONO_GENERICO = <Linea><circle cx="24" cy="24" r="16" /></Linea>;

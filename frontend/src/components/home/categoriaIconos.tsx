import type { ReactNode } from 'react';

// Iconos de línea (estilo del diseño), uno por categoría. La clave es el slug de lib/categorias.ts
function Linea({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export const ICONOS_CATEGORIA: Record<string, ReactNode> = {
  alimentos: <Linea><path d="M14 6v14a4 4 0 0 0 4 4v18M10 6v10M18 6v10M34 42V6c-5 2-7 8-7 16h7" /></Linea>,
  bienestar: <Linea><path d="M8 40C8 22 20 8 42 8c0 22-12 32-30 32" /><path d="M8 40c6-12 14-20 24-26" /></Linea>,
  fitness: <Linea><path d="M13 14v20M35 14v20M6 19v10M42 19v10M13 24h22" /></Linea>,
  autos: <Linea><path d="M8 32V22l5-12h22l5 12v10M4 32h40M12 32v6M36 32v6" /><circle cx="14" cy="26" r="1.5" /><circle cx="34" cy="26" r="1.5" /></Linea>,
  hogar: <Linea><path d="M5 22 24 6l19 16M9 20v22h30V20M20 42V30h8v12" /></Linea>,
  estetica: <Linea><circle cx="12" cy="12" r="5" /><circle cx="12" cy="36" r="5" /><path d="M16 16 42 38M16 32 42 10" /></Linea>,
  laboratorios: <Linea><path d="M18 6h12M20 6v14L9 38a4 4 0 0 0 3.5 6h23A4 4 0 0 0 39 38L28 20V6" /><path d="M14 32h20" /></Linea>,
  tecnologia: <Linea><rect x="14" y="4" width="20" height="40" rx="4" /><path d="M21 38h6" /></Linea>,
};

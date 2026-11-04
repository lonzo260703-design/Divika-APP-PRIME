'use client';

import { createContext, useContext } from 'react';
import type { Negocio, Usuario } from '@/types';

type Valor = {
  usuario: Usuario;
  negocio: Negocio;
  setNegocio: (n: Negocio) => void;
};

export const PortalContext = createContext<Valor | null>(null);

// Datos del proveedor y de su negocio, disponibles en todas las pantallas del portal
export function usePortal() {
  const v = useContext(PortalContext);
  if (!v) throw new Error('usePortal debe usarse dentro del portal');
  return v;
}

export const ESTADO_TEXTO = { en_proceso: 'Alta en proceso', publicado: 'Perfil publicado', pausado: 'Perfil pausado' } as const;
export const iniciales = (nombre: string) => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

'use client';

import { useEffect, useState } from 'react';
import type { CategoriaInfo } from '@/types';
import { api } from './api';

// Las categorías viven en el backend (GET /categorias); aquí se piden una sola vez y se reutilizan
let cache: CategoriaInfo[] | null = null;

export function useCategorias() {
  const [categorias, setCategorias] = useState<CategoriaInfo[]>(cache ?? []);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cache) return;
    api<CategoriaInfo[]>('/categorias')
      .then((datos) => {
        cache = datos;
        setCategorias(datos);
      })
      .catch(() => setError(true));
  }, []);

  return { categorias, cargando: categorias.length === 0 && !error, error };
}

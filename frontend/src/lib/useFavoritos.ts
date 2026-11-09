'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Negocio } from '@/types';

// Lista de favoritos del usuario con alta/baja inmediata en pantalla (si el servidor falla, regresa al estado anterior)
export function useFavoritos() {
  const [lista, setLista] = useState<Negocio[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Negocio[]>('/favoritos').then(setLista).catch((e: Error) => { setError(e.message); setLista([]); });
  }, []);

  const esFavorito = useCallback((id: number) => !!lista?.some((n) => n.id === id), [lista]);

  const quitar = useCallback(async (id: number) => {
    const antes = lista;
    setLista((l) => l && l.filter((n) => n.id !== id));
    try { await api(`/favoritos/${id}`, { method: 'DELETE' }); } catch (e) { setLista(antes); setError(e instanceof Error ? e.message : 'No se pudo quitar'); }
  }, [lista]);

  const agregar = useCallback(async (negocio: Negocio) => {
    const antes = lista;
    setLista((l) => [negocio, ...(l ?? []).filter((n) => n.id !== negocio.id)]);
    try { await api(`/favoritos/${negocio.id}`, { method: 'POST' }); } catch (e) { setLista(antes); setError(e instanceof Error ? e.message : 'No se pudo guardar'); }
  }, [lista]);

  return { lista, esFavorito, agregar, quitar, error, setError };
}

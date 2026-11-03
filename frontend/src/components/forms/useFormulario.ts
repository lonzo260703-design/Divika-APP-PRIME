'use client';

import { FormEvent, useState } from 'react';

// Maneja "enviando…" y errores para TODOS los formularios, así no se repite en cada uno
export function useFormulario(alEnviar: (datos: Record<string, string>) => Promise<void>) {
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await alEnviar(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal');
    } finally {
      setCargando(false);
    }
  }

  return { onSubmit, error, cargando };
}

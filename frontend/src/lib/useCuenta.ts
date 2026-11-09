'use client';

import { useEffect, useState } from 'react';
import { api } from './api';
import { actualizarUsuario } from './auth';
import type { Cuenta, Preferencias } from '@/types';

// Datos completos de la cuenta; "guardar" actualiza la copia en pantalla y la sesión guardada
export function useCuenta() {
  const [cuenta, setCuentaEstado] = useState<Cuenta | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Cuenta>('/cuenta').then(setCuentaEstado).catch((e: Error) => setError(e.message));
  }, []);

  function setCuenta(c: Cuenta) {
    setCuentaEstado(c);
    actualizarUsuario({ nombre: c.nombre, email: c.email, avatarUrl: c.avatarUrl, telefono: c.telefono ?? undefined });
  }
  return { cuenta, setCuenta, error };
}

// Preferencias con cambio inmediato: se ve al instante y se guarda; si falla, regresa al valor anterior
export function usePreferencias() {
  const [prefs, setPrefs] = useState<Preferencias | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Preferencias>('/cuenta/preferencias').then(setPrefs).catch((e: Error) => setError(e.message));
  }, []);

  async function cambiar<G extends keyof Preferencias>(grupo: G, clave: keyof Preferencias[G], valor: boolean) {
    if (!prefs) return;
    const anterior = prefs;
    setPrefs({ ...prefs, [grupo]: { ...prefs[grupo], [clave]: valor } });
    setError('');
    try {
      setPrefs(await api<Preferencias>('/cuenta/preferencias', { method: 'PUT', body: { [grupo]: { [clave]: valor } } }));
    } catch (e) {
      setPrefs(anterior);
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }
  return { prefs, cambiar, error, setError };
}

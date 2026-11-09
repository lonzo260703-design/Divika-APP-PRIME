'use client';

import { useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { Aviso } from '@/components/ui/Aviso';
import { api } from '@/lib/api';
import type { Negocio } from '@/types';

const METODOS = [
  ['efectivo', 'Efectivo', 'Cobras al atender al cliente'],
  ['transferencia', 'Transferencia', 'Depósito o transferencia bancaria'],
  ['tarjeta', 'Tarjeta', 'Terminal o link de pago propio'],
] as const;

export default function Pagos() {
  const { negocio, setNegocio } = usePortal();
  const [metodos, setMetodos] = useState<string[]>(negocio.metodosPago ?? []);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);

  const alternar = (m: string) => { setOk(''); setMetodos((l) => (l.includes(m) ? l.filter((x) => x !== m) : [...l, m])); };

  async function guardar() {
    setError(''); setOk(''); setGuardando(true);
    try {
      setNegocio(await api<Negocio>('/proveedor/negocio', { method: 'PUT', body: { metodosPago: metodos } }));
      setOk('Formas de pago guardadas');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally { setGuardando(false); }
  }

  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Formas de pago</h1>
      <p className="p-sub">Indica cómo pueden pagarte tus clientes. Divika no procesa pagos ni cobra comisión: solo se lo mostramos al cliente.</p>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <div className="grupo">
        {METODOS.map(([id, titulo, detalle]) => (
          <label key={id} className="ajuste">
            <span className="ajuste__texto"><strong>{titulo}</strong><small>{detalle}</small></span>
            <input type="checkbox" checked={metodos.includes(id)} onChange={() => alternar(id)} aria-label={titulo} />
          </label>
        ))}
      </div>
      {ok && <p className="p-sub" role="status">{ok}</p>}
      <button type="button" className="p-btn" disabled={guardando} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar'}</button>
    </div>
  );
}

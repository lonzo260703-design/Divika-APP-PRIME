'use client';

import { useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { Aviso } from '@/components/ui/Aviso';
import { Interruptor } from '@/components/ui/Interruptor';
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
  const [instrucciones, setInstrucciones] = useState(negocio.instruccionesPago ?? '');
  const [mostrar, setMostrar] = useState(negocio.mostrarPagoPerfil ?? true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);

  const alternar = (m: string) => { setOk(''); setMetodos((l) => (l.includes(m) ? l.filter((x) => x !== m) : [...l, m])); };

  async function guardar() {
    setError(''); setOk(''); setGuardando(true);
    try {
      setNegocio(await api<Negocio>('/proveedor/negocio', { method: 'PUT', body: { metodosPago: metodos, instruccionesPago: instrucciones.trim(), mostrarPagoPerfil: mostrar } }));
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
      <div className="p-form">
        <label className="p-campo p-campo--ancho">Instrucciones de pago
          <textarea rows={3} maxLength={500} value={instrucciones} placeholder="Ej. Transferencia a CLABE 0000… a nombre de Juan Pérez. Envía tu comprobante por mensaje." onChange={(e) => { setOk(''); setInstrucciones(e.target.value); }} />
          <small>Divika solo las muestra; no verifica ni procesa pagos.</small>
        </label>
        <div className="ajuste p-campo--ancho">
          <span className="ajuste__texto"><strong>Mostrar en mi perfil público</strong><small>Si lo apagas, el cliente solo verá las formas de pago, sin las instrucciones.</small></span>
          <Interruptor activo={mostrar} etiqueta="Mostrar instrucciones en el perfil" onChange={(v) => { setOk(''); setMostrar(v); }} />
        </div>
      </div>
      {ok && <p className="p-sub" role="status">{ok}</p>}
      <button type="button" className="p-btn" disabled={guardando} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar'}</button>
    </div>
  );
}

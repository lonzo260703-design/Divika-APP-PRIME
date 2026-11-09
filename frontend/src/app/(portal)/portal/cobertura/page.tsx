'use client';

import { useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { Aviso } from '@/components/ui/Aviso';
import { api } from '@/lib/api';
import type { Negocio } from '@/types';

export default function Cobertura() {
  const { negocio, setNegocio } = usePortal();
  const [radio, setRadio] = useState(String(negocio.cobertura?.radioKm ?? 5));
  const [zonas, setZonas] = useState((negocio.cobertura?.zonas ?? []).join(', '));
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setError(''); setOk(''); setGuardando(true);
    try {
      const lista = zonas.split(',').map((z) => z.trim()).filter(Boolean);
      setNegocio(await api<Negocio>('/proveedor/negocio', { method: 'PUT', body: { cobertura: { radioKm: Number(radio), zonas: lista } } }));
      setOk('Cobertura guardada');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally { setGuardando(false); }
  }

  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Ubicación y cobertura</h1>
      <p className="p-sub">Tu ubicación: {[negocio.colonia, negocio.ciudad].filter(Boolean).join(', ') || 'sin capturar'}. Cámbiala en Perfil del negocio.</p>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <div className="p-form">
        <label className="p-campo">Radio de atención (km)
          <input type="number" min={1} max={100} value={radio} onChange={(e) => { setRadio(e.target.value); setOk(''); }} />
        </label>
        <label className="p-campo p-campo--ancho">Zonas o colonias adicionales
          <input value={zonas} placeholder="Centro, Fracc. Los Remedios" onChange={(e) => { setZonas(e.target.value); setOk(''); }} />
          <small>Sepáralas con comas (máximo 15).</small>
        </label>
      </div>
      {ok && <p className="p-sub" role="status">{ok}</p>}
      <button type="button" className="p-btn" disabled={guardando} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar'}</button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { Aviso } from '@/components/ui/Aviso';
import { Interruptor } from '@/components/ui/Interruptor';
import { api } from '@/lib/api';
import type { Negocio } from '@/types';

export default function Ubicacion() {
  const { negocio, setNegocio } = usePortal();
  const [calle, setCalle] = useState(negocio.calle ?? '');
  const [colonia, setColonia] = useState(negocio.colonia ?? '');
  const [ciudad, setCiudad] = useState(negocio.ciudad ?? '');
  const [referencias, setReferencias] = useState(negocio.referencias ?? '');
  const [lat, setLat] = useState(negocio.latitud == null ? '' : String(negocio.latitud));
  const [lng, setLng] = useState(negocio.longitud == null ? '' : String(negocio.longitud));
  const [domicilio, setDomicilio] = useState(!!negocio.atiendeDomicilio);
  const [radio, setRadio] = useState(String(negocio.cobertura?.radioKm ?? 5));
  const [zonas, setZonas] = useState((negocio.cobertura?.zonas ?? []).join(', '));
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  const cambio = <T,>(f: (v: T) => void) => (v: T) => { setOk(''); f(v); };

  const coordenadas = lat !== '' && lng !== '' && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));
  const mapa = coordenadas ? `https://www.google.com/maps?q=${lat},${lng}` : `https://www.google.com/maps/search/${encodeURIComponent([calle, colonia, ciudad].filter(Boolean).join(', '))}`;

  function usarMiUbicacion() {
    setError('');
    if (!navigator.geolocation) return setError('Tu navegador no permite obtener la ubicación');
    navigator.geolocation.getCurrentPosition(
      (p) => { setOk(''); setLat(p.coords.latitude.toFixed(6)); setLng(p.coords.longitude.toFixed(6)); },
      () => setError('No pudimos obtener tu ubicación. Revisa el permiso del navegador o escribe las coordenadas.'),
    );
  }

  async function guardar() {
    setError(''); setOk(''); setGuardando(true);
    try {
      const lista = zonas.split(',').map((z) => z.trim()).filter(Boolean);
      setNegocio(await api<Negocio>('/proveedor/negocio', {
        method: 'PUT',
        body: {
          calle, colonia, ciudad, referencias,
          ...(coordenadas ? { latitud: Number(lat), longitud: Number(lng) } : {}),
          atiendeDomicilio: domicilio,
          cobertura: { radioKm: Number(radio), zonas: lista },
        },
      }));
      setOk('Ubicación guardada');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally { setGuardando(false); }
  }

  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Ubicación y cobertura</h1>
      <p className="p-sub">Dónde está tu negocio y hasta dónde llegas. Los clientes ven la dirección en tu perfil.</p>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <div className="p-form">
        <label className="p-campo p-campo--ancho">Calle y número<input value={calle} maxLength={160} onChange={(e) => cambio(setCalle)(e.target.value)} /></label>
        <label className="p-campo">Colonia<input value={colonia} onChange={(e) => cambio(setColonia)(e.target.value)} /></label>
        <label className="p-campo">Ciudad<input value={ciudad} onChange={(e) => cambio(setCiudad)(e.target.value)} /></label>
        <label className="p-campo p-campo--ancho">Referencias para llegar<textarea rows={2} maxLength={300} value={referencias} placeholder="Ej. Frente a la farmacia, portón negro" onChange={(e) => cambio(setReferencias)(e.target.value)} /></label>
        <label className="p-campo">Latitud<input inputMode="decimal" value={lat} onChange={(e) => cambio(setLat)(e.target.value)} /></label>
        <label className="p-campo">Longitud<input inputMode="decimal" value={lng} onChange={(e) => cambio(setLng)(e.target.value)} /></label>
        <div className="cita__acciones p-campo--ancho">
          <button type="button" className="p-btn p-btn--borde" onClick={usarMiUbicacion}>Usar mi ubicación actual</button>
          <a className="p-btn p-btn--borde" href={mapa} target="_blank" rel="noreferrer">Ver en el mapa</a>
        </div>
        {!coordenadas && <small className="p-campo--ancho">Sin coordenadas tu negocio no aparece en “Cerca de ti”. Usa el botón desde el negocio.</small>}

        <div className="ajuste p-campo--ancho">
          <span className="ajuste__texto"><strong>Atiendo a domicilio</strong><small>Permite crear servicios que das en casa del cliente, con costo de traslado.</small></span>
          <Interruptor activo={domicilio} etiqueta="Atiendo a domicilio" onChange={cambio(setDomicilio)} />
        </div>
        <label className="p-campo">Radio de atención (km)
          <input type="number" min={1} max={100} value={radio} onChange={(e) => cambio(setRadio)(e.target.value)} />
        </label>
        <label className="p-campo p-campo--ancho">Zonas o colonias adicionales
          <input value={zonas} placeholder="Centro, Fracc. Los Remedios" onChange={(e) => cambio(setZonas)(e.target.value)} />
          <small>Sepáralas con comas (máximo 15).</small>
        </label>
      </div>
      {ok && <p className="p-sub" role="status">{ok}</p>}
      <button type="button" className="p-btn" disabled={guardando} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar'}</button>
    </div>
  );
}

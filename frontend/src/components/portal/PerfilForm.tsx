'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import type { Negocio } from '@/types';

export type Valores = {
  nombre: string; categoria: string; subcategoria: string; descripcion: string;
  telefono: string; whatsapp: string; emailPublico: string;
};

export const valoresDe = (n: Negocio): Valores => ({
  nombre: n.nombre, categoria: n.categoria, subcategoria: n.subcategoria ?? '', descripcion: n.descripcion ?? '',
  telefono: n.telefono, whatsapp: n.whatsapp ?? '', emailPublico: n.emailPublico ?? '',
});

type Props = {
  negocio: Negocio;
  // "completo" = pantalla Perfil del negocio; "basico" = paso 2 del registro (sin nombre ni categoría)
  modo: 'completo' | 'basico';
  onGuardado: (n: Negocio) => void;
  onCambio?: (v: Valores) => void;
  etiquetaGuardar: string;
  alCancelar?: boolean;
};

// Formulario del perfil del negocio, compartido por el registro y el portal
export function PerfilForm({ negocio, modo, onGuardado, onCambio, etiquetaGuardar, alCancelar = true }: Props) {
  const { categorias } = useCategorias();
  const original = useMemo(() => valoresDe(negocio), [negocio]);
  const [v, setV] = useState<Valores>(original);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => { setV(original); }, [original]);
  useEffect(() => { onCambio?.(v); }, [v]); // eslint-disable-line react-hooks/exhaustive-deps

  const sucio = JSON.stringify(v) !== JSON.stringify(original);
  const subs = categorias.find((c) => c.slug === v.categoria)?.subcategorias ?? [];
  const campo = (k: keyof Valores) => ({ value: v[k], onChange: (e: { target: { value: string } }) => { setGuardado(false); setV((x) => ({ ...x, [k]: e.target.value })); } });

  async function guardar() {
    setError('');
    setGuardando(true);
    try {
      const cuerpo: Partial<Valores> = { descripcion: v.descripcion, telefono: v.telefono, whatsapp: v.whatsapp };
      if (v.emailPublico.trim()) cuerpo.emailPublico = v.emailPublico.trim();
      if (modo === 'completo') Object.assign(cuerpo, { nombre: v.nombre, categoria: v.categoria, subcategoria: v.subcategoria });
      onGuardado(await api<Negocio>('/proveedor/negocio', { method: 'PUT', body: cuerpo }));
      setGuardado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="p-form">
        {modo === 'completo' && (
          <>
            <label className="p-campo">Nombre del negocio *<input {...campo('nombre')} maxLength={120} /></label>
            <label className="p-campo">Categoría *
              <select value={v.categoria} onChange={(e) => { setGuardado(false); setV((x) => ({ ...x, categoria: e.target.value, subcategoria: '' })); }}>
                {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
              </select>
            </label>
            <label className="p-campo p-campo--ancho">Tipo de servicio
              <select {...campo('subcategoria')}>
                <option value="">Sin especificar</option>
                {subs.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </>
        )}
        <label className="p-campo p-campo--ancho">Descripción *
          <textarea {...campo('descripcion')} rows={4} maxLength={600} placeholder="Cuenta qué hace especial a tu negocio" />
          <small>{v.descripcion.length} / 600 caracteres. Describe qué hace especial a tu negocio.</small>
        </label>
        <label className="p-campo">Teléfono *<input {...campo('telefono')} inputMode="tel" /></label>
        <label className="p-campo">WhatsApp<input {...campo('whatsapp')} inputMode="tel" /></label>
        <label className="p-campo p-campo--ancho">Correo de contacto público
          <input {...campo('emailPublico')} type="email" placeholder="hola@minegocio.mx" />
          <small>Puede ser distinto al correo que usas para iniciar sesión.</small>
        </label>
      </div>

      {error && <p className="form__error" role="alert">{error}</p>}
      <div className="p-barra">
        <span>{guardado ? 'Cambios guardados.' : sucio ? 'Cambios sin guardar · Tu perfil actual no cambia.' : 'Sin cambios por guardar.'}</span>
        <div>
          {alCancelar && <button type="button" className="p-btn p-btn--borde" disabled={!sucio} onClick={() => { setV(original); setError(''); }}>Cancelar</button>}
          <button type="button" className="p-btn" disabled={guardando || !sucio} onClick={guardar}>{guardando ? 'Guardando…' : etiquetaGuardar}</button>
        </div>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { Aviso } from '@/components/ui/Aviso';
import { Interruptor } from '@/components/ui/Interruptor';
import { api } from '@/lib/api';
import { pesos } from '@/lib/reservas';
import type { Modalidad, Servicio } from '@/types';

type Form = { id?: number; nombre: string; descripcion: string; precio: string; duracionMin: string; categoria: string; modalidad: Modalidad; costoTraslado: string; indicaciones: string; fotoUrl: string | null };
const VACIO: Form = { nombre: '', descripcion: '', precio: '', duracionMin: '60', categoria: '', modalidad: 'local', costoTraslado: '', indicaciones: '', fotoUrl: null };
const MODALIDADES: [Modalidad, string][] = [['local', 'En mi negocio'], ['domicilio', 'A domicilio'], ['ambos', 'Ambas']];
const ETIQUETA: Record<Modalidad, string> = { local: 'En el negocio', domicilio: 'A domicilio', ambos: 'Negocio o domicilio' };

const aForm = (s: Servicio): Form => ({
  id: s.id, nombre: s.nombre, descripcion: s.descripcion ?? '', precio: s.precio == null ? '' : String(s.precio), duracionMin: String(s.duracionMin),
  categoria: s.categoria ?? '', modalidad: s.modalidad, costoTraslado: s.costoTraslado == null ? '' : String(s.costoTraslado), indicaciones: s.indicaciones ?? '', fotoUrl: s.fotoUrl,
});

export default function Servicios() {
  const { negocio } = usePortal();
  const [lista, setLista] = useState<Servicio[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'todos' | 'publicados' | 'ocultos'>('todos');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const entrada = useRef<HTMLInputElement>(null);
  const cargar = useCallback(() => api<Servicio[]>('/proveedor/servicios').then(setLista).catch((e: Error) => { setError(e.message); setLista([]); }), []);
  useEffect(() => { cargar(); }, [cargar]);

  const categorias = Array.from(new Set((lista ?? []).map((s) => s.categoria).filter((c): c is string => !!c)));
  const cuerpo = (f: Form, activo?: boolean) => ({
    nombre: f.nombre.trim(),
    descripcion: f.descripcion.trim() || undefined,
    precio: f.precio === '' ? null : Number(f.precio),
    duracionMin: Number(f.duracionMin),
    categoria: f.categoria.trim() || undefined,
    modalidad: f.modalidad,
    costoTraslado: f.modalidad !== 'local' && f.costoTraslado !== '' ? Number(f.costoTraslado) : null,
    indicaciones: f.indicaciones.trim() || undefined,
    ...(activo === undefined ? {} : { activo }),
  });

  function elegirFoto(f?: File) {
    if (!f) return;
    if (!/^image\/(jpeg|png)$/.test(f.type)) return setError('Solo se aceptan fotos JPG o PNG');
    if (f.size > 10 * 1024 * 1024) return setError('La foto puede pesar máximo 10 MB');
    setError('');
    setFoto(f);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError('');
    try {
      const s = await api<Servicio>(form.id ? `/proveedor/servicios/${form.id}` : '/proveedor/servicios', { method: form.id ? 'PUT' : 'POST', body: cuerpo(form, form.id ? lista?.find((x) => x.id === form.id)?.activo : true) });
      if (foto) {
        const datos = new FormData();
        datos.append('foto', foto);
        await api(`/proveedor/servicios/${s.id}/foto`, { method: 'POST', body: datos });
      } else if (form.id && !form.fotoUrl && lista?.find((x) => x.id === form.id)?.fotoUrl) {
        await api(`/proveedor/servicios/${s.id}/foto`, { method: 'DELETE' });
      }
      setForm(null); setFoto(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  }
  async function activar(s: Servicio, activo: boolean) {
    setError('');
    try {
      await api(`/proveedor/servicios/${s.id}`, { method: 'PUT', body: cuerpo(aForm(s), activo) });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar');
    }
  }
  async function borrar(s: Servicio) {
    if (!window.confirm(`¿Eliminar “${s.nombre}”?`)) return;
    try {
      await api(`/proveedor/servicios/${s.id}`, { method: 'DELETE' });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  }
  const abrir = (f: Form) => { setForm(f); setFoto(null); setError(''); };
  const previa = foto ? URL.createObjectURL(foto) : form?.fotoUrl ?? null;

  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Mis servicios</h1>
      <p className="p-sub">Lo que ofreces, con precio, duración y dónde lo das. Los clientes eligen uno al reservar.</p>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}

      {form ? (
        <form className="p-form" onSubmit={guardar}>
          <label className="p-campo p-campo--ancho">Nombre del servicio *<input value={form.nombre} maxLength={80} required onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label className="p-campo">Categoría
            <input value={form.categoria} maxLength={60} list="cats-servicio" placeholder="Ej. Cabello" onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <datalist id="cats-servicio">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label className="p-campo">Duración (min) *<input type="number" min={5} max={720} required value={form.duracionMin} onChange={(e) => setForm({ ...form, duracionMin: e.target.value })} /></label>
          <label className="p-campo">Precio (MXN)<input type="number" min={0} value={form.precio} placeholder="A consultar" onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label>
          <label className="p-campo p-campo--ancho">Descripción<textarea value={form.descripcion} maxLength={400} rows={3} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>

          <div className="p-campo p-campo--ancho" role="radiogroup" aria-label="Dónde das el servicio">
            Dónde lo das
            <div className="tabs">
              {MODALIDADES.map(([m, t]) => (
                <button key={m} type="button" role="radio" aria-checked={form.modalidad === m} aria-pressed={form.modalidad === m} disabled={m !== 'local' && !negocio.atiendeDomicilio} onClick={() => setForm({ ...form, modalidad: m })}>{t}</button>
              ))}
            </div>
            {!negocio.atiendeDomicilio && <small>Para ofrecer servicio a domicilio actívalo en <Link href="/portal/cobertura" className="p-enlace">Ubicación y cobertura</Link>.</small>}
          </div>
          {form.modalidad !== 'local' && (
            <label className="p-campo">Costo de traslado (MXN)<input type="number" min={0} value={form.costoTraslado} placeholder="Sin costo" onChange={(e) => setForm({ ...form, costoTraslado: e.target.value })} /></label>
          )}
          <label className="p-campo p-campo--ancho">Indicaciones para el cliente<textarea value={form.indicaciones} maxLength={400} rows={2} placeholder="Ej. Ten a la mano el equipo; llega 10 min antes" onChange={(e) => setForm({ ...form, indicaciones: e.target.value })} /></label>

          <div className="p-campo p-campo--ancho">Foto del servicio
            <div className="p-item">
              {previa ? <img src={previa} alt="Vista previa" className="servicio-foto" /> : <span className="servicio-foto servicio-foto--vacia" aria-hidden>Sin foto</span>}
              <span className="cita__acciones">
                <button type="button" className="p-btn p-btn--borde" onClick={() => entrada.current?.click()}>{previa ? 'Cambiar foto' : 'Subir foto'}</button>
                {previa && <button type="button" className="enlace-boton enlace-boton--rojo" onClick={() => { setFoto(null); setForm({ ...form, fotoUrl: null }); }}>Quitar</button>}
              </span>
            </div>
            <input ref={entrada} type="file" accept="image/jpeg,image/png" hidden onChange={(e) => { elegirFoto(e.target.files?.[0]); e.target.value = ''; }} />
            <small>JPG o PNG, máximo 10 MB.</small>
          </div>

          <div className="cita__acciones p-campo--ancho">
            <button type="submit" className="p-btn">Guardar servicio</button>
            <button type="button" className="p-btn p-btn--borde" onClick={() => { setForm(null); setFoto(null); }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <button type="button" className="p-btn" onClick={() => abrir(VACIO)}>Agregar servicio</button>
      )}

      {lista && lista.length > 0 && (
        <>
          <div className="stats">
            <div className="stat"><strong>{lista.filter((x) => x.activo).length}</strong><small>Servicios publicados</small></div>
            <div className="stat"><strong>{lista.filter((x) => !x.activo).length}</strong><small>Servicios ocultos</small></div>
            <div className="stat"><strong>{lista.length}</strong><small>Total</small></div>
          </div>
          <div className="tabs" role="tablist">
            {(['todos', 'publicados', 'ocultos'] as const).map((t) => <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
          </div>
          {categorias.length > 0 && (
            <div className="tabs" aria-label="Filtrar por categoría">
              <button type="button" aria-pressed={cat === ''} onClick={() => setCat('')}>Todas las categorías</button>
              {categorias.map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          )}
          <input type="search" className="p-buscar" placeholder="Buscar servicio" aria-label="Buscar servicio" value={q} onChange={(e) => setQ(e.target.value)} />
        </>
      )}
      {lista && lista.length === 0 && !form && <p className="p-sub">Aún no tienes servicios. Agrega el primero.</p>}
      {lista && lista.length > 0 && (
        <div className="grupo">
          {lista.filter((x) => (tab === 'todos' || (tab === 'publicados') === x.activo) && (!cat || x.categoria === cat) && x.nombre.toLowerCase().includes(q.toLowerCase())).map((s) => (
            <div key={s.id} className="servicio-fila" style={{ opacity: s.activo ? 1 : 0.55 }}>
              {s.fotoUrl && <img src={s.fotoUrl} alt="" className="servicio-foto servicio-foto--chica" />}
              <span><strong>{s.nombre}</strong><small>{[s.categoria, pesos(s.precio), `${s.duracionMin} min`, ETIQUETA[s.modalidad], s.modalidad !== 'local' && s.costoTraslado ? `traslado ${pesos(s.costoTraslado)}` : null, s.activo ? null : 'oculto'].filter(Boolean).join(' · ')}</small></span>
              <span className="cita__acciones">
                <Interruptor activo={s.activo} etiqueta={`Mostrar ${s.nombre}`} onChange={(v) => activar(s, v)} />
                <button type="button" className="enlace-boton" onClick={() => abrir(aForm(s))}>Editar</button>
                <button type="button" className="enlace-boton enlace-boton--rojo" onClick={() => borrar(s)}>Eliminar</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

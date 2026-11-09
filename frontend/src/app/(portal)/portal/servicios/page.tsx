'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { Interruptor } from '@/components/ui/Interruptor';
import { api } from '@/lib/api';
import { pesos } from '@/lib/reservas';
import type { Servicio } from '@/types';

type Form = { id?: number; nombre: string; descripcion: string; precio: string; duracionMin: string };
const VACIO: Form = { nombre: '', descripcion: '', precio: '', duracionMin: '60' };

export default function Servicios() {
  const [lista, setLista] = useState<Servicio[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'todos' | 'publicados' | 'ocultos'>('todos');
  const [q, setQ] = useState('');
  const cargar = useCallback(() => api<Servicio[]>('/proveedor/servicios').then(setLista).catch((e: Error) => { setError(e.message); setLista([]); }), []);
  useEffect(() => { cargar(); }, [cargar]);

  const cuerpo = (f: Form, activo?: boolean) => ({
    nombre: f.nombre.trim(),
    descripcion: f.descripcion.trim() || undefined,
    precio: f.precio === '' ? null : Number(f.precio),
    duracionMin: Number(f.duracionMin),
    ...(activo === undefined ? {} : { activo }),
  });

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError('');
    try {
      await api(form.id ? `/proveedor/servicios/${form.id}` : '/proveedor/servicios', { method: form.id ? 'PUT' : 'POST', body: cuerpo(form, form.id ? lista?.find((s) => s.id === form.id)?.activo : true) });
      setForm(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  }
  async function activar(s: Servicio, activo: boolean) {
    setError('');
    try {
      await api(`/proveedor/servicios/${s.id}`, { method: 'PUT', body: { nombre: s.nombre, descripcion: s.descripcion ?? undefined, precio: s.precio, duracionMin: s.duracionMin, activo } });
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

  return (
    <div className="p-estrecho">
      <h1 className="p-titulo">Mis servicios</h1>
      <p className="p-sub">Lo que ofreces, con precio y duración. Los clientes eligen uno al reservar.</p>
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}

      {form ? (
        <form className="p-form" onSubmit={guardar}>
          <label className="p-campo p-campo--ancho">Nombre del servicio *<input value={form.nombre} maxLength={80} required onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label className="p-campo p-campo--ancho">Descripción<textarea value={form.descripcion} maxLength={400} rows={3} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
          <label className="p-campo">Precio (MXN)<input type="number" min={0} value={form.precio} placeholder="A consultar" onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label>
          <label className="p-campo">Duración (min) *<input type="number" min={5} max={720} required value={form.duracionMin} onChange={(e) => setForm({ ...form, duracionMin: e.target.value })} /></label>
          <div className="cita__acciones p-campo--ancho">
            <button type="submit" className="p-btn">Guardar servicio</button>
            <button type="button" className="p-btn p-btn--borde" onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <button type="button" className="p-btn" onClick={() => setForm(VACIO)}>Agregar servicio</button>
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
          <input type="search" className="p-buscar" placeholder="Buscar servicio" aria-label="Buscar servicio" value={q} onChange={(e) => setQ(e.target.value)} />
        </>
      )}
      {lista && lista.length === 0 && !form && <p className="p-sub">Aún no tienes servicios. Agrega el primero.</p>}
      {lista && lista.length > 0 && (
        <div className="grupo">
          {lista.filter((x) => (tab === 'todos' || (tab === 'publicados') === x.activo) && x.nombre.toLowerCase().includes(q.toLowerCase())).map((s) => (
            <div key={s.id} className="servicio-fila" style={{ opacity: s.activo ? 1 : 0.55 }}>
              <span><strong>{s.nombre}</strong><small>{pesos(s.precio)} · {s.duracionMin} min{s.activo ? '' : ' · oculto'}</small></span>
              <span className="cita__acciones">
                <Interruptor activo={s.activo} etiqueta={`Mostrar ${s.nombre}`} onChange={(v) => activar(s, v)} />
                <button type="button" className="enlace-boton" onClick={() => setForm({ id: s.id, nombre: s.nombre, descripcion: s.descripcion ?? '', precio: s.precio == null ? '' : String(s.precio), duracionMin: String(s.duracionMin) })}>Editar</button>
                <button type="button" className="enlace-boton enlace-boton--rojo" onClick={() => borrar(s)}>Eliminar</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

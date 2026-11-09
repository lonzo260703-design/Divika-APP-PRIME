'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Notificaciones as Preferencias } from '@/components/perfil/Notificaciones';
import { api } from '@/lib/api';
import { cx } from '@/lib/cx';
import { useEscritorio } from '@/lib/useEscritorio';
import type { Notificacion } from '@/types';

const FILTROS = [['todas', 'Todas'], ['nuevas', 'Sin leer'], ['cita', 'Citas'], ['mensaje', 'Mensajes'], ['resena', 'Reseñas']] as const;
type Filtro = (typeof FILTROS)[number][0];

const dia = (iso: string) => {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return 'Hoy';
  if (d.toDateString() === ayer.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
};
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

export default function Avisos() {
  const escritorio = useEscritorio() === true;
  const [items, setItems] = useState<Notificacion[] | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const cargar = useCallback(() => api<{ items: Notificacion[] }>('/notificaciones').then((r) => setItems(r.items)).catch(() => setItems([])), []);
  useEffect(() => { cargar(); }, [cargar]);

  async function marcarTodas() {
    await api('/notificaciones/leer-todas', { method: 'POST' }).catch(() => {});
    cargar();
    window.dispatchEvent(new Event('divika:avisos'));
  }
  const abrir = (n: Notificacion) => { if (!n.leida) api(`/notificaciones/${n.id}/leer`, { method: 'POST' }).then(() => window.dispatchEvent(new Event('divika:avisos'))).catch(() => {}); };

  const lista = (items ?? []).filter((n) => filtro === 'todas' || (filtro === 'nuevas' ? !n.leida : n.tipo === filtro));
  const grupos = lista.reduce<Record<string, Notificacion[]>>((g, n) => { (g[dia(n.creadoEn)] ??= []).push(n); return g; }, {});

  return (
    <div className={escritorio ? 'p-ancho' : 'p-estrecho'}>
      <div className="p-cab-pagina">
        <div>
          <h1 className="p-titulo">Notificaciones</h1>
          <p className="p-sub">Lo importante de tu negocio, en un solo lugar.</p>
        </div>
        <button type="button" className="p-btn p-btn--borde" onClick={marcarTodas}>Marcar todas como leídas</button>
      </div>
      <div className={escritorio ? 'p-dos' : undefined}>
        <div className="p-tarjeta">
          <div className="tabs" role="tablist">
            {FILTROS.map(([id, t]) => <button key={id} type="button" aria-pressed={filtro === id} onClick={() => setFiltro(id)}>{t}</button>)}
          </div>
          {items && lista.length === 0 && <p className="p-sub">No hay avisos por ahora.</p>}
          {Object.entries(grupos).map(([d, ns]) => (
            <section key={d}>
              <p className="aviso-dia">{d}</p>
              {ns.map((n) => (
                <Link key={n.id} href={n.enlace ?? '/portal'} onClick={() => abrir(n)} className={cx('aviso-fila', !n.leida && 'aviso-fila--nueva')}>
                  <span><strong>{n.titulo}</strong>{n.detalle && <small>{n.detalle}</small>}</span>
                  <time>{hora(n.creadoEn)}</time>
                </Link>
              ))}
            </section>
          ))}
        </div>
        <div className="p-tarjeta">
          <h2>A tu manera</h2>
          <p className="p-sub">Elige por dónde y de qué quieres que te avisemos.</p>
          <Preferencias cabecera={false} />
        </div>
      </div>
    </div>
  );
}

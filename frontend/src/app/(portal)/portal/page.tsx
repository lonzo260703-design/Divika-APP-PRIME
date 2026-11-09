'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePortal } from '@/components/portal/PortalContext';
import { api } from '@/lib/api';
import { fechaCorta, iso } from '@/lib/reservas';
import type { Cita, Conversacion, Resena, Servicio } from '@/types';

export default function PortalInicio() {
  const { usuario, negocio } = usePortal();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [convs, setConvs] = useState<Conversacion[]>([]);
  useEffect(() => {
    api<Cita[]>('/proveedor/citas').then(setCitas).catch(() => {});
    api<Resena[]>('/proveedor/resenas').then(setResenas).catch(() => {});
    api<Servicio[]>('/proveedor/servicios').then(setServicios).catch(() => {});
    api<Conversacion[]>('/proveedor/mensajes').then(setConvs).catch(() => {});
  }, []);

  const hoy = iso(new Date());
  const pendientes = citas.filter((c) => c.estado === 'solicitada');
  const proximas = citas.filter((c) => c.estado === 'confirmada' && c.fecha >= hoy).sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
  const sinLeer = convs.reduce((n, c) => n + c.sinLeer, 0);
  const contactos = negocio.clicsWhatsapp + negocio.clicsLlamada;

  const pasos: [string, boolean, string][] = [
    ['Fotos y datos del perfil', !!negocio.galeria?.length && !!negocio.descripcion, '/portal/perfil'],
    ['Al menos un servicio', servicios.length > 0, '/portal/servicios'],
    ['Formas de pago', !!negocio.metodosPago?.length, '/portal/pagos'],
    ['Ubicación y cobertura', !!negocio.cobertura, '/portal/cobertura'],
    ['Perfil publicado', negocio.estado === 'publicado', '/portal/perfil'],
  ];
  const hechos = pasos.filter(([, ok]) => ok).length;
  const pct = Math.round((hechos / pasos.length) * 100);

  return (
    <>
      <div className="p-cab-pagina">
        <div>
          <h1 className="p-titulo">Hola, {usuario.nombre.split(' ')[0]}</h1>
          <p className="p-sub">Este es el movimiento de {negocio.nombre}.</p>
        </div>
        <span className="p-paso-chip">{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
      </div>

      {negocio.estado !== 'publicado' && (
        <section className="p-tarjeta p-aviso-grande">
          <h2>{negocio.estado === 'pausado' ? 'Tu perfil está pausado' : 'Tu perfil aún no está publicado'}</h2>
          <p>{negocio.estado === 'pausado' ? 'No aparece en el directorio hasta que lo vuelvas a publicar.' : 'Completa tus datos y fotos y publícalo para que los clientes te encuentren.'}</p>
          <Link href="/portal/perfil" className="p-btn">Ir a Perfil del negocio</Link>
        </section>
      )}

      <div className="stats stats--4">
        <Link href="/portal/solicitudes" className="stat"><strong>{pendientes.length}</strong><small>Solicitudes por responder</small></Link>
        <Link href="/portal/calendario" className="stat"><strong>{proximas.length}</strong><small>Citas confirmadas próximas</small></Link>
        <div className="stat"><strong>{contactos}</strong><small>Contactos (WhatsApp y llamadas)</small></div>
        <Link href="/portal/resenas" className="stat"><strong>{resenas.length ? negocio.calificacion.toFixed(1) : '—'}</strong><small>{resenas.length} reseña{resenas.length === 1 ? '' : 's'}</small></Link>
      </div>

      <div className="p-dos">
        <div className="p-col">
          <section className="p-tarjeta">
            <div className="p-fila-cab"><h2>Solicitudes por responder</h2>{pendientes.length > 0 && <span className="chip-estado chip-estado--pendiente">{pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'}</span>}</div>
            {pendientes.length === 0 && <p className="p-sub">No tienes solicitudes pendientes.</p>}
            {pendientes.slice(0, 3).map((c) => (
              <div key={c.id} className="p-item">
                <span className="p-avatar p-avatar--chico">{c.cliente.nombre.charAt(0).toUpperCase()}</span>
                <span><strong>{c.cliente.nombre}</strong><small>{c.servicio?.nombre ?? 'Cita'} · {fechaCorta(c.fecha)} · {c.hora} h</small></span>
                <Link href="/portal/solicitudes" className="p-enlace">Ver solicitud</Link>
              </div>
            ))}
          </section>
          <section className="p-tarjeta">
            <div className="p-fila-cab"><h2>Tus próximas citas</h2><Link href="/portal/calendario" className="p-enlace">Ver calendario</Link></div>
            {proximas.length === 0 && <p className="p-sub">Aún no hay citas confirmadas.</p>}
            {proximas.slice(0, 4).map((c) => (
              <div key={c.id} className="p-item">
                <span className="p-fecha"><strong>{new Date(`${c.fecha}T12:00:00`).getDate()}</strong><small>{new Date(`${c.fecha}T12:00:00`).toLocaleDateString('es-MX', { month: 'short' })}</small></span>
                <span><strong>{c.hora} h · {c.cliente.nombre}</strong><small>{c.servicio?.nombre ?? 'Cita'}</small></span>
                <span className="chip-estado">Confirmada</span>
              </div>
            ))}
          </section>
        </div>

        <div className="p-col">
          <section className="p-tarjeta">
            <div className="p-fila-cab"><h2>Completa la configuración</h2><strong>{pct}%</strong></div>
            <div className="p-medidor"><span style={{ width: `${pct}%` }} /></div>
            {pasos.map(([t, ok, href]) => (
              <Link key={t} href={href} className={`p-check${ok ? ' p-check--ok' : ''}`}><span aria-hidden>{ok ? '✓' : '○'}</span>{t}</Link>
            ))}
          </section>
          <section className="p-tarjeta">
            <div className="p-fila-cab"><h2>Mensajes sin leer</h2>{sinLeer > 0 && <span className="conv-fila__n">{sinLeer}</span>}</div>
            {sinLeer === 0 && <p className="p-sub">Estás al día.</p>}
            {convs.filter((c) => c.sinLeer > 0).slice(0, 3).map((c) => (
              <Link key={c.con.id} href={`/portal/mensajes/${c.con.id}`} className="p-item">
                <span className="p-avatar p-avatar--chico">{c.con.nombre.charAt(0).toUpperCase()}</span>
                <span><strong>{c.con.nombre}</strong><small>{c.ultimo.texto}</small></span>
              </Link>
            ))}
            <Link href="/portal/mensajes" className="p-enlace">Abrir mensajes</Link>
          </section>
        </div>
      </div>
    </>
  );
}

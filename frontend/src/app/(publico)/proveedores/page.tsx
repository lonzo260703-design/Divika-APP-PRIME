'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormulario } from '@/components/forms/useFormulario';
import { Cabecera } from '@/components/web/Cabecera';
import { Pie } from '@/components/web/Pie';
import { api } from '@/lib/api';

const MOTIVOS = [
  { icono: '📍', titulo: 'Más clientes cerca de ti', texto: 'Aparece en las búsquedas de tu colonia o alcaldía cuando la gente necesita tu negocio.' },
  { icono: '💬', titulo: 'Trato directo y sin comisión', texto: 'Tus clientes te contactan directamente, sin intermediarios.' },
  { icono: '⭐', titulo: 'Construye tu reputación', texto: 'Sube fotos de tus trabajos y recibe opiniones de tus clientes para generar más confianza.' },
];

const PASOS = [
  { n: 1, titulo: 'Crea tu perfil', texto: 'Ingresa los datos de tu negocio, horarios y zona de servicio.' },
  { n: 2, titulo: 'Muestra tu trabajo', texto: 'Sube fotos de tus mejores proyectos y tus datos de contacto.' },
  { n: 3, titulo: '¡Recibe llamadas y mensajes!', texto: 'Los clientes te encuentran y te contactan directamente.' },
];

// Landing para atraer proveedores (versión web)
export default function ProveedoresPage() {
  const [enviado, setEnviado] = useState(false);
  const { onSubmit, error, cargando } = useFormulario(async (datos) => {
    await api('/proveedores/interesados', { method: 'POST', body: datos });
    setEnviado(true);
  });

  return (
    <div className="web-pagina">
      <Cabecera />

      <section className="web-prov">
        <div className="web-prov__texto">
          <h1>Lleva más clientes a tu negocio o servicio local</h1>
          <p>
            <strong className="rojo">Regístrate gratis</strong> en el directorio número uno de tu zona. Recibe solicitudes directas sin pagar comisiones abusivas.
          </p>
        </div>

        <div className="web-prov__form">
          <h2>Únete gratis a Divika</h2>
          {enviado ? (
            <>
              <p className="web-prov__ok" role="status">¡Gracias! Recibimos tus datos y te contactaremos muy pronto.</p>
              <Link href="/proveedores/registro" className="web-btn web-btn--oscuro web-btn--block web-prov__sigue">Crear mi cuenta ahora</Link>
            </>
          ) : (
            <form onSubmit={onSubmit}>
              <input name="nombreNegocio" required placeholder="Nombre de tu negocio o servicio" aria-label="Nombre de tu negocio o servicio" />
              <input name="servicio" required placeholder="¿Qué servicio ofreces? (Ej: plomero, mecánico)" aria-label="Servicio que ofreces" />
              <input name="telefono" required inputMode="tel" placeholder="Teléfono / WhatsApp" aria-label="Teléfono o WhatsApp" />
              <input name="ciudad" required placeholder="Tu ciudad" aria-label="Tu ciudad" />
              {error && <p className="form__error" role="alert">{error}</p>}
              <button type="submit" className="web-btn web-btn--oscuro web-btn--block" disabled={cargando}>
                {cargando ? 'Enviando…' : 'Registrar mi negocio'}
              </button>
              <p className="web-prov__otro">¿Prefieres crear tu cuenta ya? <Link href="/proveedores/registro">Empieza aquí</Link></p>
            </form>
          )}
        </div>
      </section>

      <section className="web-blanca">
        <h2>¿Por qué anunciarte en Divika?</h2>
        <div className="web-motivos">
          {MOTIVOS.map((m) => (
            <article key={m.titulo} className="web-motivo">
              <span className="web-motivo__icono" aria-hidden>{m.icono}</span>
              <h3>{m.titulo}</h3>
              <p>{m.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="web-pasos">
        <h2>Cómo funciona en 3 pasos</h2>
        <ol>
          {PASOS.map((p, i) => (
            <li key={p.n}>
              <span className="web-pasos__n">{p.n}</span>
              <div><h3>{p.titulo}</h3><p>{p.texto}</p></div>
              {i < PASOS.length - 1 && <span className="web-pasos__flecha" aria-hidden>→</span>}
            </li>
          ))}
        </ol>
      </section>

      <Pie />
    </div>
  );
}

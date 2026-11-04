'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FotosNegocio } from '@/components/portal/FotosNegocio';
import { PerfilForm, Valores, valoresDe } from '@/components/portal/PerfilForm';
import { ESTADO_TEXTO, usePortal } from '@/components/portal/PortalContext';
import { Estrellas } from '@/components/negocio/Estrellas';
import { IconExternal } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import { cx } from '@/lib/cx';
import type { Negocio } from '@/types';

const AVISOS = {
  publicado: ['p-aviso--ok', 'Tu perfil está publicado', 'Los cambios se guardan cuando confirmas. Tu información actual seguirá visible mientras editas.'],
  en_proceso: ['p-aviso--ambar', 'Tu perfil aún no está publicado', 'Completa los datos y las fotos, y publícalo para que aparezca en el directorio.'],
  pausado: ['p-aviso--gris', 'Tu perfil está oculto', 'No aparece en búsquedas. Tus datos y conversaciones se conservan.'],
} as const;

export default function PerfilPage() {
  const { negocio, setNegocio } = usePortal();
  const { categorias } = useCategorias();
  const [vista, setVista] = useState<Valores>(valoresDe(negocio));
  const [error, setError] = useState('');
  const estado = negocio.estado ?? 'publicado';
  const [claseAviso, tituloAviso, textoAviso] = AVISOS[estado];

  async function cambiarEstado(accion: 'publicar' | 'pausar') {
    setError('');
    try {
      setNegocio(await api<Negocio>(`/proveedor/negocio/${accion}`, { method: 'POST' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado');
    }
  }

  const nombreCategoria = categorias.find((c) => c.slug === vista.categoria)?.nombre ?? vista.categoria;

  return (
    <>
      <div className="p-encabezado">
        <div>
          <h1 className="p-titulo">El perfil de tu negocio</h1>
          <p className="p-sub">Así te conocen las personas que buscan servicios cerca de ellas.</p>
        </div>
        {estado === 'publicado' && <Link href={`/negocio/${negocio.id}`} className="p-btn p-btn--borde">Ver perfil público <IconExternal /></Link>}
      </div>

      <div className={cx('p-aviso', claseAviso)} role="status"><strong>{tituloAviso}</strong><span>{textoAviso}</span></div>

      <div className="p-columnas">
        <div className="p-columna">
          <section className="p-tarjeta">
            <h2>Información del negocio</h2>
            <PerfilForm negocio={negocio} modo="completo" onGuardado={setNegocio} onCambio={setVista} etiquetaGuardar="Guardar cambios" />
          </section>
          <section className="p-tarjeta">
            <h2>Fotos del negocio</h2>
            <p className="p-sub">Muestra tu espacio y tus mejores trabajos. La primera foto es la portada.</p>
            <FotosNegocio negocio={negocio} onCambio={setNegocio} />
          </section>
        </div>

        <div className="p-columna p-columna--lateral">
          <section className="p-tarjeta">
            <h2>Vista previa</h2>
            <p className="p-sub">Así aparece tu tarjeta en Divika.</p>
            <div className="p-previa">
              {negocio.imagenUrl ? <img src={negocio.imagenUrl} alt="" /> : <div className="p-previa__vacio">Sin foto</div>}
              <span className="chip-mini">{nombreCategoria}</span>
              <strong>{vista.nombre || 'Tu negocio'}</strong>
              <small>{[negocio.colonia, negocio.ciudad].filter(Boolean).join(' · ') || negocio.direccion}</small>
              <span className="p-previa__calif"><Estrellas valor={negocio.calificacion} /> {negocio.calificacion.toFixed(1)}</span>
            </div>
          </section>
          <section className="p-tarjeta">
            <h2>Estado de publicación</h2>
            <span className={cx('p-estado', `p-estado--${estado}`)}>{ESTADO_TEXTO[estado]}</span>
            <p className="p-sub">{estado === 'publicado' ? 'Tu negocio puede aparecer en las búsquedas de su categoría.' : 'Tu negocio no aparece en el directorio.'}</p>
            {error && <p className="form__error" role="alert">{error}</p>}
            {estado === 'publicado' ? (
              <>
                <p className="p-pausa">¿Necesitas hacer una pausa?</p>
                <button type="button" className="p-btn p-btn--borde" onClick={() => cambiarEstado('pausar')}>Ocultar perfil temporalmente</button>
              </>
            ) : (
              <button type="button" className="p-btn" onClick={() => cambiarEstado('publicar')}>{estado === 'pausado' ? 'Volver a publicar' : 'Publicar mi negocio'}</button>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

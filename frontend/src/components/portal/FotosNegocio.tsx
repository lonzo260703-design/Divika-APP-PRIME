'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { Negocio } from '@/types';
import { IconTrash } from '../ui/icons';

const MAX = 10;

// Subir, quitar y elegir la portada de las fotos del negocio
export function FotosNegocio({ negocio, onCambio }: { negocio: Negocio; onCambio: (n: Negocio) => void }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const fotos = negocio.galeria ?? [];

  async function subir(archivos: FileList | null) {
    if (!archivos?.length) return;
    setError('');
    setSubiendo(true);
    try {
      let actual = negocio;
      for (const f of Array.from(archivos)) {
        if (!/^image\/(jpeg|png)$/.test(f.type)) throw new Error('Solo se aceptan fotos JPG o PNG');
        if (f.size > 10 * 1024 * 1024) throw new Error('Cada foto puede pesar máximo 10 MB');
        const datos = new FormData();
        datos.append('foto', f);
        actual = await api<Negocio>('/proveedor/negocio/fotos', { method: 'POST', body: datos });
        onCambio(actual);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto');
    } finally {
      setSubiendo(false);
      if (entrada.current) entrada.current.value = '';
    }
  }

  async function accion(f: () => Promise<Negocio>) {
    setError('');
    try {
      onCambio(await f());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal');
    }
  }

  const hacerPortada = (i: number) =>
    accion(() => api<Negocio>('/proveedor/negocio/fotos/orden', { method: 'PUT', body: { orden: [i, ...fotos.map((_, k) => k).filter((k) => k !== i)] } }));
  const quitar = (i: number) => accion(() => api<Negocio>(`/proveedor/negocio/fotos/${i}`, { method: 'DELETE' }));

  return (
    <div className="fotos">
      <div className="fotos__rejilla">
        {fotos.map((url, i) => (
          <figure key={url} className="foto">
            <img src={url} alt={i === 0 ? 'Portada del negocio' : `Foto ${i + 1} del negocio`} />
            <figcaption>
              <span>{i === 0 ? 'Portada' : `Foto ${i + 1}`}</span>
              <span className="foto__acciones">
                {i > 0 && <button type="button" onClick={() => hacerPortada(i)}>Hacer portada</button>}
                <button type="button" onClick={() => quitar(i)} aria-label={`Quitar foto ${i + 1}`}><IconTrash /></button>
              </span>
            </figcaption>
          </figure>
        ))}
        {fotos.length === 0 && <p className="fotos__vacio">Aún no hay fotos. Muestra tu espacio y tus mejores trabajos.</p>}
      </div>
      <div className="fotos__pie">
        <input ref={entrada} type="file" accept="image/jpeg,image/png" multiple hidden onChange={(e) => subir(e.target.files)} />
        <button type="button" className="p-btn p-btn--borde" disabled={subiendo || fotos.length >= MAX} onClick={() => entrada.current?.click()}>
          {subiendo ? 'Subiendo…' : 'Subir fotos'}
        </button>
        <span>{fotos.length} de {MAX} fotos · JPG o PNG, hasta 10 MB por foto</span>
      </div>
      {error && <p className="form__error" role="alert">{error}</p>}
    </div>
  );
}

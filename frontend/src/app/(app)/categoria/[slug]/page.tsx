'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ListadoWeb } from '@/components/web/ListadoWeb';
import { useEscritorio } from '@/lib/useEscritorio';
import { Atras } from '@/components/layout/Atras';
import { NegocioGridCard } from '@/components/negocio/NegocioGridCard';
import { IconSort } from '@/components/ui/icons';
import { SearchBar } from '@/components/ui/SearchBar';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import { cx } from '@/lib/cx';
import type { Negocio } from '@/types';

type Ubicacion = { lat: number; lng: number };

function CategoriaMovil() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { categorias, cargando } = useCategorias();
  const categoria = categorias.find((c) => c.slug === slug);

  const [buscar, setBuscar] = useState('');
  const [sub, setSub] = useState<string | null>(null);
  const [orden, setOrden] = useState<'calificacion' | 'distancia'>('calificacion');
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState('');

  // La ubicación solo sirve para mostrar distancias y ordenar por cercanía; si no se da permiso, la pantalla sigue funcionando
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUbicacion({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ categoria: slug });
    if (sub) params.set('subcategoria', sub);
    if (buscar.trim()) params.set('buscar', buscar.trim());
    if (ubicacion) {
      params.set('lat', String(ubicacion.lat));
      params.set('lng', String(ubicacion.lng));
      params.set('orden', orden);
    }
    const espera = setTimeout(() => {
      api<Negocio[]>(`/negocios?${params}`)
        .then((datos) => {
          setNegocios(datos);
          setError('');
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setListo(true));
    }, 250);
    return () => clearTimeout(espera);
  }, [slug, sub, buscar, orden, ubicacion]);

  if (!cargando && !categoria) {
    return (
      <>
        <div className="cabecera"><Atras href="/home" /><h1 className="titulo">Categoría no encontrada</h1></div>
      </>
    );
  }

  return (
    <>
      <div className="cabecera">
        <Atras href="/home" />
        <h1 className="titulo">{categoria?.nombre ?? ''}</h1>
      </div>

      <SearchBar value={buscar} onChange={setBuscar} placeholder="Buscar en esta categoría" />

      {categoria && (
        <div className="chips" role="tablist" aria-label="Subcategorías">
          {[null, ...categoria.subcategorias].map((s) => (
            <button
              key={s ?? 'todos'}
              type="button"
              role="tab"
              aria-selected={sub === s}
              className={cx('chip', sub === s && 'chip--activo')}
              onClick={() => setSub(s)}
            >
              {s ?? 'Todos'}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="orden"
        disabled={!ubicacion}
        title={ubicacion ? 'Cambiar orden' : 'Activa tu ubicación para ordenar por distancia'}
        onClick={() => setOrden((o) => (o === 'calificacion' ? 'distancia' : 'calificacion'))}
      >
        <IconSort /> {ubicacion && orden === 'distancia' ? 'Distancia' : 'Mejor calificados'}
      </button>

      {error && <p className="form__error">{error}</p>}
      {listo && !error && negocios.length === 0 && <p className="texto-aparte">No encontramos negocios con esa búsqueda.</p>}
      <div className="resultados">
        {negocios.map((n) => (
          <NegocioGridCard key={n.id} negocio={n} onPress={() => router.push(`/negocio/${n.id}`)} />
        ))}
      </div>
    </>
  );
}


export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();
  const escritorio = useEscritorio();
  if (escritorio === null) return null;
  return escritorio ? <ListadoWeb key={slug} slug={slug} /> : <CategoriaMovil />;
}

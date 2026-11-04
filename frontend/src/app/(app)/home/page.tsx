'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NegocioCard } from '@/components/negocio/NegocioCard';
import { PromoBanner } from '@/components/home/PromoBanner';
import { TopTenItem } from '@/components/negocio/TopTenItem';
import { IconPin } from '@/components/ui/icons';
import { SearchBar } from '@/components/ui/SearchBar';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import type { Negocio } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { categorias } = useCategorias();
  const [buscar, setBuscar] = useState('');
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [top, setTop] = useState<Negocio[]>([]);
  const [error, setError] = useState('');
  const [cargado, setCargado] = useState(false);

  // Cada vez que cambia la búsqueda o la categoría, pide la lista al backend
  useEffect(() => {
    const params = new URLSearchParams();
    if (buscar.trim()) params.set('buscar', buscar.trim());
    const espera = setTimeout(() => {
      api<Negocio[]>(`/negocios?${params}`)
        .then((datos) => {
          setNegocios(datos);
          setError('');
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setCargado(true));
    }, 250); // espera 250 ms para no pedir en cada tecla
    return () => clearTimeout(espera);
  }, [buscar]);

  useEffect(() => {
    api<Negocio[]>('/negocios/top').then(setTop).catch(() => {});
  }, []);

  return (
    <>
      <SearchBar value={buscar} onChange={setBuscar} />
      <PromoBanner />
      <CategoryGrid categorias={categorias} onSelect={(slug) => router.push(`/categoria/${slug}`)} />

      <section>
        <h2 className="seccion--cerca"><IconPin /> Cerca de ti…</h2>
        {error && <p className="form__error">{error}</p>}
        {cargado && !error && negocios.length === 0 && <p className="texto-aparte">No encontramos negocios con esa búsqueda.</p>}
        <div className="carrusel">
          {negocios.map((n) => (
            <NegocioCard key={n.id} negocio={n} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="seccion">Top 10</h2>
        <div className="carrusel">
          {top.map((n, i) => (
            <TopTenItem key={n.id} imageUrl={n.imagenUrl ?? undefined} title={n.nombre} subtitle={n.categoria} position={i + 1} />
          ))}
        </div>
      </section>
    </>
  );
}

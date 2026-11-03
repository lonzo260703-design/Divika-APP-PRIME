'use client';

import { useEffect, useState } from 'react';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NegocioCard } from '@/components/negocio/NegocioCard';
import { PromoBanner } from '@/components/home/PromoBanner';
import { TopTenItem } from '@/components/negocio/TopTenItem';
import { SearchBar } from '@/components/ui/SearchBar';
import { api } from '@/lib/api';
import type { Negocio } from '@/types';

export default function HomePage() {
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [top, setTop] = useState<Negocio[]>([]);
  const [error, setError] = useState('');

  // Cada vez que cambia la búsqueda o la categoría, pide la lista al backend
  useEffect(() => {
    const params = new URLSearchParams();
    if (buscar.trim()) params.set('buscar', buscar.trim());
    if (categoria) params.set('categoria', categoria);
    const espera = setTimeout(() => {
      api<Negocio[]>(`/negocios?${params}`)
        .then((datos) => {
          setNegocios(datos);
          setError('');
        })
        .catch((e: Error) => setError(e.message));
    }, 250); // espera 250 ms para no pedir en cada tecla
    return () => clearTimeout(espera);
  }, [buscar, categoria]);

  useEffect(() => {
    api<Negocio[]>('/negocios/top').then(setTop).catch(() => {});
  }, []);

  return (
    <>
      <SearchBar value={buscar} onChange={setBuscar} />
      <PromoBanner />
      <CategoryGrid activa={categoria} onSelect={setCategoria} />

      <section>
        <h2 className="seccion">Cerca de ti</h2>
        {error && <p className="form__error">{error}</p>}
        {!error && negocios.length === 0 && <p className="texto-aparte">No encontramos negocios con esa búsqueda.</p>}
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

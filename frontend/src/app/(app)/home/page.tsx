'use client';

import { useEffect, useState } from 'react';
import { LandingContenido } from '@/components/web/LandingWeb';
import { ListadoWeb } from '@/components/web/ListadoWeb';

export default function HomePage() {
  const [consulta, setConsulta] = useState<string | null>(null);
  useEffect(() => { setConsulta(new URLSearchParams(window.location.search).get('buscar') ?? ''); }, []);
  if (consulta === null) return null;
  // Con búsqueda se muestran resultados; sin ella, el inicio
  return consulta ? <ListadoWeb consulta={consulta} /> : <LandingContenido />;
}

'use client';

import { useParams } from 'next/navigation';
import { ListadoWeb } from '@/components/web/ListadoWeb';

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();
  return <ListadoWeb key={slug} slug={slug} />;
}

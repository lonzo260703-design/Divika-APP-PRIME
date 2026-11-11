'use client';

import { useParams } from 'next/navigation';
import { NegocioWeb } from '@/components/web/NegocioWeb';

export default function NegocioPage() {
  const { id } = useParams<{ id: string }>();
  return <NegocioWeb key={id} id={id} />;
}

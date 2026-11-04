'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { getToken } from '@/lib/auth';

// Protege TODAS las pantallas de este grupo: sin sesión te manda al inicio
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // Sin sesión: en celular al inicio; en escritorio a la pantalla de acceso (el inicio web es público)
    if (!getToken()) router.replace(window.matchMedia('(min-width: 900px)').matches ? '/login' : '/');
    else setListo(true);
  }, [router]);

  if (!listo) return null;

  return (
    <>
      <main className="screen">{children}</main>
      <BottomNav />
    </>
  );
}

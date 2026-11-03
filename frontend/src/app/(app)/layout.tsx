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
    if (!getToken()) router.replace('/');
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

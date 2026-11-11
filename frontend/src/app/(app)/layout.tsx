'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { MarcoWeb } from '@/components/web/MarcoWeb';
import { getToken } from '@/lib/auth';

// Protege TODAS las pantallas de este grupo: sin sesión te manda a iniciar sesión
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace('/login');
    else setListo(true);
  }, [router]);

  if (!listo) return null;
  return <MarcoWeb>{children}</MarcoWeb>;
}

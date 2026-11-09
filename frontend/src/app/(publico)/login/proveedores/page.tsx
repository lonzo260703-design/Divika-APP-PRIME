'use client';

import { LoginProveedorMovil } from '@/components/forms/LoginProveedorMovil';
import { LoginWeb } from '@/components/web/LoginWeb';
import { useEscritorio } from '@/lib/useEscritorio';

export default function LoginProveedoresPage() {
  const escritorio = useEscritorio();
  if (escritorio === null) return null;
  return escritorio ? <LoginWeb tipo="proveedor" /> : <LoginProveedorMovil />;
}

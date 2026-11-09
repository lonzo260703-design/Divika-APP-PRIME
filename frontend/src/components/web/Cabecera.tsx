'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { IconHeart, IconSearch } from '../ui/icons';
import { getUsuario } from '@/lib/auth';
import type { Usuario } from '@/types';

// Barra superior de la versión web
export function Cabecera({ variante = 'inicio' }: { variante?: 'inicio' | 'interior' }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [q, setQ] = useState('');
  useEffect(() => setUsuario(getUsuario()), []);

  function buscar(e: FormEvent) {
    e.preventDefault();
    router.push(`/home${q.trim() ? `?buscar=${encodeURIComponent(q.trim())}` : ''}`);
  }

  return (
    <header className={`web-cab${variante === 'interior' ? ' web-cab--interior' : ''}`}>
      <Link href="/" aria-label="Divika, inicio" className="web-cab__logo"><img src="/logo.png" alt="Divika" /></Link>
      {variante === 'inicio' ? (
        <form className="web-cab__busqueda" onSubmit={buscar} role="search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué necesitas hoy?" aria-label="Buscar servicios" />
          <button type="submit" aria-label="Buscar"><IconSearch /></button>
        </form>
      ) : (
        <nav className="web-cab__nav" aria-label="Explorar"><Link href="/home" className="web-cab__enlace web-cab__enlace--fuerte">Explorar servicios</Link></nav>
      )}
      <nav className="web-cab__links" aria-label="Principal">
        <Link href={usuario ? '/favoritos' : '/login'} className="web-cab__enlace"><IconHeart /> Guardados</Link>
        {usuario ? (
          <Link href="/perfil" className="web-cab__enlace">Hola, {usuario.nombre.split(' ')[0]}</Link>
        ) : (
          <Link href="/login" className="web-cab__enlace">Inicia sesión</Link>
        )}
        <Link href={usuario?.rol === 'negocio' ? '/portal' : '/proveedores'} className="web-cab__boton">{usuario?.rol === 'negocio' ? 'Mi portal' : 'Registra tu negocio'}</Link>
      </nav>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ICONOS_CATEGORIA, ICONO_GENERICO } from '../home/categoriaIconos';
import { Estrellas } from '../negocio/Estrellas';
import { IconPin } from '../ui/icons';
import { Cabecera } from './Cabecera';
import { ImagenOpcional } from './ImagenOpcional';
import { Pie } from './Pie';
import { api } from '@/lib/api';
import { useCategorias } from '@/lib/categorias';
import type { Negocio } from '@/types';

// Contenido del inicio web (sin cabecera ni pie: los pone quien lo use)
export function LandingContenido() {
  const router = useRouter();
  const { categorias } = useCategorias();
  const [recomendados, setRecomendados] = useState<Negocio[]>([]);
  const [servicio, setServicio] = useState('');
  const [ciudad, setCiudad] = useState('');

  useEffect(() => {
    api<Negocio[]>('/negocios/top').then((n) => setRecomendados(n.slice(0, 3))).catch(() => setRecomendados([]));
  }, []);

  function buscar(e: FormEvent) {
    e.preventDefault();
    const q = [servicio.trim()].filter(Boolean).join(' ');
    router.push(`/home${q ? `?buscar=${encodeURIComponent(q)}` : ''}`);
  }

  return (
    <>
      <section className="web-hero">
        <div className="web-hero__texto">
          <h1>
            <span className="web-hero__azul">Explora servicios</span>
            <span className="web-hero__rojo">locales, rápido y seguro</span>
          </h1>
          <form className="web-buscador" onSubmit={buscar} role="search">
            <input value={servicio} onChange={(e) => setServicio(e.target.value)} placeholder="¿Qué servicio buscabas?" aria-label="Servicio" />
            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ubicación / Ciudad" aria-label="Ciudad" />
            <button type="submit">BUSCAR</button>
          </form>
        </div>
        <ImagenOpcional src="/web/hero.png" alt="Profesionales de distintos oficios" etiqueta="Imagen: hero.png" className="web-hero__img" />
      </section>

      <section className="web-seccion">
        <h2>Categorías populares</h2>
        <div className="web-cats">
          {categorias.slice(0, 8).map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="web-cat">
              <span className="web-cat__icono">{ICONOS_CATEGORIA[c.slug] ?? ICONO_GENERICO}</span>
              <strong>{c.nombre}</strong>
              <small>{c.subcategorias.length} tipos de servicio</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="web-seccion">
        <h2>Servicios recomendados</h2>
        <div className="web-recs">
          {recomendados.map((n) => (
            <article key={n.id} className="web-rec">
              <div className="web-rec__foto">
                {n.imagenUrl ? <img src={n.imagenUrl} alt={n.nombre} /> : <div className="card__image--vacio">🖼️</div>}
                <span className="web-rec__calif"><Estrellas valor={n.calificacion} /></span>
              </div>
              <div className="web-rec__cuerpo">
                <small>{n.categoria}</small>
                <h3>{n.nombre}</h3>
                <p className="web-rec__meta">
                  <span className="chip-mini">{n.subcategoria ?? n.categoria}</span>
                  <span><IconPin /> {n.direccion}</span>
                </p>
                <Link href={`/negocio/${n.id}`} className="web-btn web-btn--azul web-btn--block">Contactar</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

    </>
  );
}

// Inicio de la versión web (pública: se ve sin iniciar sesión)
export function LandingWeb() {
  return (
    <div className="web-pagina">
      <Cabecera />
      <LandingContenido />
      <Pie />
    </div>
  );
}

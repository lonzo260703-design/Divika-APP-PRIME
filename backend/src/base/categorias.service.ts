import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entidades';
import { CATALOGO } from '../modules/negocios/categorias';

// Convierte "Bares & antros" → "bares-antros"
export const aSlug = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type Info = { id: string; slug: string; nombre: string; padreSlug: string | null };

// Tabla categories: las principales tienen parent_id NULL y las subcategorías apuntan a su principal.
// Al arrancar se agregan las que falten del catálogo (modules/negocios/categorias.ts) y se guardan en memoria.
@Injectable()
export class CategoriasService implements OnModuleInit {
  private porId = new Map<string, Info>();
  private principales: Info[] = [];
  private hijas = new Map<string, Info[]>(); // slug principal → subcategorías
  private carga: Promise<void> | null = null;

  constructor(@InjectRepository(Categoria) private repo: Repository<Categoria>) {}

  onModuleInit() {
    return this.listo();
  }

  listo() {
    this.carga ??= this.sembrarYCargar();
    return this.carga;
  }

  private async sembrarYCargar() {
    for (const c of CATALOGO) {
      let padre = await this.repo.findOneBy({ slug: c.slug });
      if (!padre) padre = await this.repo.save(this.repo.create({ slug: c.slug, name: c.nombre, parentId: null }));
      for (const sub of c.subcategorias) {
        const slug = `${c.slug}-${aSlug(sub)}`;
        if (!(await this.repo.existsBy({ slug }))) await this.repo.save(this.repo.create({ slug, name: sub, parentId: padre.id }));
      }
    }
    await this.recargar();
  }

  // Slugs de las subcategorías del catálogo actual (las demás se pueden limpiar si nadie las usa)
  slugsSubcategorias() {
    return CATALOGO.flatMap((c) => c.subcategorias.map((sub) => `${c.slug}-${aSlug(sub)}`));
  }

  async recargar() {
    const todas = await this.repo.find({ order: { createdAt: 'ASC', name: 'ASC' } });
    const orden = (slug: string) => {
      const i = CATALOGO.findIndex((c) => c.slug === slug);
      return i === -1 ? 999 : i;
    };
    const slugDe = new Map(todas.map((c) => [c.id, c.slug]));
    this.porId = new Map(todas.map((c) => [c.id, { id: c.id, slug: c.slug, nombre: c.name, padreSlug: c.parentId ? slugDe.get(c.parentId) ?? null : null }]));
    this.principales = [...this.porId.values()].filter((c) => !c.padreSlug).sort((a, b) => orden(a.slug) - orden(b.slug) || a.nombre.localeCompare(b.nombre));
    this.hijas = new Map(this.principales.map((p) => [p.slug, [...this.porId.values()].filter((c) => c.padreSlug === p.slug)]));
    for (const p of this.principales) {
      const lista = CATALOGO.find((c) => c.slug === p.slug)?.subcategorias as readonly string[] | undefined;
      const pos = (n: string) => (lista?.indexOf(n) ?? -1) === -1 ? 999 : lista!.indexOf(n);
      this.hijas.get(p.slug)!.sort((a, b) => pos(a.nombre) - pos(b.nombre) || a.nombre.localeCompare(b.nombre));
    }
  }

  // Formato de GET /categorias: [{ slug, nombre, subcategorias: [nombres] }]
  catalogo() {
    return this.principales.map((p) => ({ slug: p.slug, nombre: p.nombre, subcategorias: (this.hijas.get(p.slug) ?? []).map((h) => h.nombre) }));
  }

  slugs() {
    return this.principales.map((p) => p.slug);
  }

  info(id: string) {
    return this.porId.get(id) ?? null;
  }

  idPrincipal(slug: string) {
    return this.principales.find((p) => p.slug === slug)?.id ?? null;
  }

  idSubcategoria(slugPrincipal: string, nombre: string) {
    return this.hijas.get(slugPrincipal)?.find((h) => h.nombre === nombre)?.id ?? null;
  }

  // Valida y devuelve los ids a guardar en business_categories (la principal con is_primary = true)
  ids(categoria: string, subcategoria?: string | null) {
    const principal = this.idPrincipal(categoria);
    if (!principal) throw new BadRequestException('Elige una categoría válida');
    if (!subcategoria) return { principal, sub: null };
    const sub = this.idSubcategoria(categoria, subcategoria);
    if (!sub) throw new BadRequestException('Esa subcategoría no pertenece a la categoría elegida');
    return { principal, sub };
  }
}

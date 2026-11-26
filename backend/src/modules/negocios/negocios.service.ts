import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoriasService } from '../../base/categorias.service';
import { NegocioVistaService, VistaNegocio } from '../../base/negocio-vista.service';
import { DetalleNegocio, DireccionNegocio, EventoContacto, HorarioNegocio, Negocio, NegocioCategoria, VisitaNegocio } from '../../entidades';
import { slugNegocio } from '../auth/auth.service';
import { CENTRO, NEGOCIOS_EJEMPLO } from './negocios.seed';

const img = (n: number) => `https://picsum.photos/seed/divika${n}/300/400`;

const distanciaKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const rad = (v: number) => (v * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return Number((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

const porCalificacion = (a: VistaNegocio, b: VistaNegocio) => b.calificacion - a.calificacion || a.nombre.localeCompare(b.nombre);

@Injectable()
export class NegociosService implements OnModuleInit {
  constructor(
    @InjectRepository(Negocio) private repo: Repository<Negocio>,
    @InjectRepository(EventoContacto) private contactos: Repository<EventoContacto>,
    @InjectRepository(VisitaNegocio) private visitas: Repository<VisitaNegocio>,
    private vistas: NegocioVistaService,
    private cats: CategoriasService,
    private ds: DataSource,
  ) {}

  // Negocios de ejemplo (source = 'precargado', sin dueño), tomados del diseño en Figma.
  // Se cargan si la base no tiene negocios, o reemplazan a los ejemplos anteriores. Nunca tocan negocios reales.
  // No se inventan reseñas: su calificación queda en 0 hasta que alguien opine. SEMBRAR_EJEMPLOS=false lo apaga.
  async onModuleInit() {
    if (process.env.SEMBRAR_EJEMPLOS === 'false') return;
    await this.cats.listo();
    const total = await this.repo.count();
    const ejemplos = await this.repo.count({ where: { source: 'precargado' } });
    const alDia = await this.repo.existsBy({ slug: NEGOCIOS_EJEMPLO[0].slug, source: 'precargado' });
    if (alDia || (total > 0 && ejemplos === 0)) return;
    const horario = [
      [0, null, null, true], [1, '09:00', '19:00', false], [2, '09:00', '19:00', false], [3, '09:00', '19:00', false],
      [4, '09:00', '19:00', false], [5, '09:00', '19:00', false], [6, '10:00', '15:00', false],
    ] as const;
    await this.ds.transaction(async (m) => {
      // Ejemplos anteriores (se borran en cascada sus fotos, horarios, favoritos y citas de prueba)
      if (ejemplos > 0) await m.delete(Negocio, { source: 'precargado' });
      for (const [i, e] of NEGOCIOS_EJEMPLO.entries()) {
        // Hacia el norte o hacia el este del centro, para que la distancia coincida con la del diseño
        const lat = CENTRO.lat + (i % 2 === 0 ? e.km / 111 : 0);
        const lng = CENTRO.lng + (i % 2 === 1 ? e.km / (111 * Math.cos((CENTRO.lat * Math.PI) / 180)) : 0);
        // Número de ejemplo que no existe (la central 000 no se asigna): así nadie llama a un teléfono real
        const tel = `6180000${String(i + 1).padStart(3, '0')}`;
        const n = await m.save(
          m.create(Negocio, { tradeName: e.nombre, slug: e.slug, shortDescription: e.descripcion, phonePublic: tel, whatsapp: tel, coverUrl: `/ejemplos/${e.slug}.jpg`, status: 'verificado', source: 'precargado' }),
        );
        const { principal, sub } = this.cats.ids(e.categoria, e.subcategoria);
        await m.insert(NegocioCategoria, [{ businessId: n.id, categoryId: principal, isPrimary: true }, ...(sub ? [{ businessId: n.id, categoryId: sub, isPrimary: false }] : [])]);
        await m.insert(DireccionNegocio, {
          businessId: n.id, street: 'Dirección por confirmar', neighborhood: e.colonia, city: 'Durango', state: 'Durango', postalCode: '34000',
          location: { type: 'Point', coordinates: [lng, lat] },
        });
        if (e.colonia) await m.insert(HorarioNegocio, horario.map(([weekday, openTime, closeTime, isClosed]) => ({ businessId: n.id, weekday, openTime, closeTime, isClosed })));
        await m.insert(DetalleNegocio, { businessId: n.id, locationConfirmed: false });
      }
      // Subcategorías que ya no están en el catálogo y nadie usa
      await m.query(`DELETE FROM categories c WHERE c.parent_id IS NOT NULL AND NOT (c.slug = ANY($1)) AND NOT EXISTS (SELECT 1 FROM business_categories bc WHERE bc.category_id = c.id)`, [this.cats.slugsSubcategorias()]);
    });
    await this.cats.recargar();
  }

  async listar(f: { buscar?: string; categoria?: string; subcategoria?: string; orden?: 'calificacion' | 'distancia'; lat?: number; lng?: number }) {
    const principal = f.categoria ? this.cats.idPrincipal(f.categoria) : null;
    if (f.categoria && !principal) return [];
    const sub = f.subcategoria && f.categoria ? this.cats.idSubcategoria(f.categoria, f.subcategoria) : null;
    if (f.subcategoria && !sub) return [];
    const lista = await this.vistas.visibles((q) => {
      if (f.buscar) q.andWhere('n.trade_name ILIKE :buscar', { buscar: `%${f.buscar.replace(/[%_]/g, '')}%` });
      if (principal) q.andWhere('EXISTS (SELECT 1 FROM business_categories bc WHERE bc.business_id = n.id AND bc.category_id = :principal)', { principal });
      if (sub) q.andWhere('EXISTS (SELECT 1 FROM business_categories bs WHERE bs.business_id = n.id AND bs.category_id = :sub)', { sub });
    });
    const hayUbicacion = Number.isFinite(f.lat) && Number.isFinite(f.lng);
    const resultado = (await this.vistas.vistas(lista)).map((n) => ({
      ...n,
      distanciaKm: hayUbicacion && n.latitud !== null && n.longitud !== null ? distanciaKm(f.lat!, f.lng!, n.latitud, n.longitud) : null,
    }));
    if (f.orden === 'distancia' && hayUbicacion) return resultado.sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
    return resultado.sort(porCalificacion);
  }

  async top(cantidad = 10) {
    return (await this.vistas.vistas(await this.vistas.visibles())).sort(porCalificacion).slice(0, cantidad);
  }

  // Perfil público: datos del negocio y solo id y nombre del dueño
  async uno(id: string) {
    const n = await this.vistas.existente(id);
    return { ...(await this.vistas.vista(n)), owner: n.owner ? { id: n.owner.id, nombre: n.owner.nCompleto } : null };
  }

  private async exigirVisible(id: string) {
    if (!(await this.vistas.esVisible(id))) throw new NotFoundException('Negocio no encontrado');
  }

  async registrarVisita(id: string) {
    await this.exigirVisible(id);
    await this.visitas.insert({ businessId: id });
    return { ok: true };
  }

  async registrarContacto(id: string, tipo: 'whatsapp' | 'llamada') {
    await this.exigirVisible(id);
    await this.contactos.insert({ businessId: id, type: tipo });
    return { ok: true };
  }
}

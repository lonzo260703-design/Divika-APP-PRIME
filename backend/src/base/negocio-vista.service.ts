import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { DetalleNegocio, DireccionNegocio, FotoNegocio, HorarioNegocio, Negocio, NegocioCategoria } from '../entidades';
import { AgendaNegocio, DIAS } from '../modules/agenda/disponibilidad';
import { CategoriasService } from './categorias.service';
import { urlPublica } from '../common/almacenamiento';

export type EstadoApi = 'en_proceso' | 'publicado' | 'pausado';

// "Sale en el directorio": publicado (pendiente de verificación o verificado), sin borrar y sin pausar
export const VISIBLE_SQL = `n.status IN ('pending', 'verificado') AND n.deleted_at IS NULL AND NOT EXISTS (SELECT 1 FROM business_details d WHERE d.business_id = n.id AND d.paused_at IS NOT NULL)`;

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : null);

// Arma la respuesta de un negocio con el mismo formato que usaba la API (el front no cambia),
// juntando businesses + business_addresses + business_categories + business_hours + business_photos
// + business_details + promedio de reviews + conteo de contact_events.
@Injectable()
export class NegocioVistaService {
  constructor(
    @InjectRepository(Negocio) private negocios: Repository<Negocio>,
    @InjectRepository(DireccionNegocio) private direcciones: Repository<DireccionNegocio>,
    @InjectRepository(NegocioCategoria) private categorias: Repository<NegocioCategoria>,
    @InjectRepository(HorarioNegocio) private horarios: Repository<HorarioNegocio>,
    @InjectRepository(FotoNegocio) private fotos: Repository<FotoNegocio>,
    @InjectRepository(DetalleNegocio) private detalles: Repository<DetalleNegocio>,
    private cats: CategoriasService,
    private ds: DataSource,
  ) {}

  consulta() {
    return this.negocios.createQueryBuilder('n');
  }

  async visibles(filtrar?: (q: ReturnType<NegocioVistaService['consulta']>) => void) {
    const q = this.consulta().where(VISIBLE_SQL);
    filtrar?.(q);
    return q.getMany();
  }

  async esVisible(id: string) {
    return this.consulta().where('n.id = :id', { id }).andWhere(VISIBLE_SQL).getExists();
  }

  // El negocio (no borrado) o 404
  async existente(id: string) {
    const n = await this.negocios.findOne({ where: { id, deletedAt: IsNull() }, relations: { owner: true } });
    if (!n) throw new NotFoundException('Negocio no encontrado');
    return n;
  }

  // El negocio del proveedor con sesión (el primero que registró)
  async delDueno(userId: string) {
    const n = await this.negocios.findOne({ where: { ownerId: userId, deletedAt: IsNull() }, order: { createdAt: 'ASC' } });
    if (!n) throw new ForbiddenException('Tu cuenta no tiene un negocio');
    return n;
  }

  async detalle(businessId: string) {
    return (await this.detalles.findOneBy({ businessId })) ?? this.detalles.create({ businessId });
  }

  // Horario y reglas de reserva para el motor de disponibilidad
  async agenda(businessId: string): Promise<AgendaNegocio> {
    const [h, d] = await Promise.all([this.horarios.findBy({ businessId }), this.detalles.findOneBy({ businessId })]);
    return { horariosJson: this.horariosJson(h), bloqueos: d?.blockedDates ?? null, disponibilidad: d?.bookingRules ?? null };
  }

  horariosJson(filas: HorarioNegocio[]) {
    if (!filas.length) return null;
    return Object.fromEntries(
      DIAS.map((dia, i) => {
        const f = filas.find((x) => x.weekday === i);
        return [dia, f ? { apertura: hhmm(f.openTime) ?? '00:00', cierre: hhmm(f.closeTime) ?? '00:00', cerrado: f.isClosed } : { apertura: '00:00', cierre: '00:00', cerrado: true }];
      }),
    );
  }

  estado(n: Negocio, d?: DetalleNegocio | null): EstadoApi {
    if (n.status === 'draft') return 'en_proceso';
    if (n.status === 'rechazado' || n.status === 'suspendido' || d?.pausedAt) return 'pausado';
    return 'publicado';
  }

  async vista(n: Negocio, opciones: { privado?: boolean } = {}) {
    return (await this.vistas([n], opciones))[0];
  }

  // privado = el dueño ve sus instrucciones de pago aunque no las muestre en el perfil
  async vistas(lista: Negocio[], { privado = false }: { privado?: boolean } = {}) {
    if (!lista.length) return [];
    const ids = lista.map((n) => n.id);
    const [dirs, cats, hrs, fts, dets, calif, contactos] = await Promise.all([
      this.direcciones.findBy({ businessId: In(ids) }),
      this.categorias.findBy({ businessId: In(ids) }),
      this.horarios.findBy({ businessId: In(ids) }),
      this.fotos.find({ where: { businessId: In(ids), type: 'galeria' }, order: { position: 'ASC' } }),
      this.detalles.findBy({ businessId: In(ids) }),
      this.ds.query(`SELECT business_id, AVG(rating)::float AS prom, COUNT(*)::int AS total FROM reviews WHERE status = 'publicado' AND business_id = ANY($1) GROUP BY business_id`, [ids]),
      this.ds.query(`SELECT business_id, type, COUNT(*)::int AS total FROM contact_events WHERE business_id = ANY($1) GROUP BY business_id, type`, [ids]),
    ]);

    return lista.map((n) => {
      const dir = dirs.find((x) => x.businessId === n.id);
      const det = dets.find((x) => x.businessId === n.id) ?? null;
      const mis = cats.filter((x) => x.businessId === n.id);
      const principal = mis.find((x) => x.isPrimary);
      const sub = mis.find((x) => !x.isPrimary);
      const c = calif.find((x: { business_id: string }) => x.business_id === n.id);
      const clics = (t: string) => contactos.find((x: { business_id: string; type: string }) => x.business_id === n.id && x.type === t)?.total ?? 0;
      const galeria = fts.filter((f) => f.businessId === n.id).map((f) => f.url);
      const confirmada = !!det?.locationConfirmed && !!dir;
      const mostrarPago = det?.showPaymentOnProfile ?? true;
      return {
        id: n.id,
        slug: n.slug,
        nombre: n.tradeName,
        descripcionCorta: n.shortDescription,
        descripcion: det?.description ?? null,
        categoria: principal ? this.cats.info(principal.categoryId)?.slug ?? '' : '',
        subcategoria: sub ? this.cats.info(sub.categoryId)?.nombre ?? null : null,
        telefono: n.phonePublic ?? '',
        whatsapp: n.whatsapp,
        emailPublico: det?.publicEmail ?? null,
        sitioWeb: n.website,
        rfc: n.taxId,
        direccion: [dir?.street, dir?.neighborhood, dir?.city].filter(Boolean).join(', '),
        calle: dir?.street || null,
        colonia: dir?.neighborhood ?? null,
        ciudad: dir?.city ?? null,
        codigoPostal: dir?.postalCode || null,
        referencias: det?.addressReferences ?? null,
        latitud: confirmada ? dir!.location.coordinates[1] : null,
        longitud: confirmada ? dir!.location.coordinates[0] : null,
        estado: this.estado(n, det),
        verificado: n.status === 'verificado',
        horario: null as string | null,
        horariosJson: this.horariosJson(hrs.filter((h) => h.businessId === n.id)),
        calificacion: c ? Math.round(c.prom * 10) / 10 : 0,
        totalResenas: c?.total ?? 0,
        imagenUrl: urlPublica(n.coverUrl) ?? galeria[0] ?? null,
        galeria,
        metodosPago: det?.paymentMethods ?? null,
        atiendeDomicilio: det?.homeService ?? false,
        mostrarPagoPerfil: mostrarPago,
        instruccionesPago: privado || mostrarPago ? det?.paymentInstructions ?? null : null,
        cobertura: det?.coverageRadiusKm ? { radioKm: det.coverageRadiusKm, zonas: det.coverageZones ?? [] } : null,
        clicsWhatsapp: clics('whatsapp'),
        clicsLlamada: clics('llamada'),
        creadoEn: n.createdAt,
      };
    });
  }
}

export type VistaNegocio = Awaited<ReturnType<NegocioVistaService['vista']>>;

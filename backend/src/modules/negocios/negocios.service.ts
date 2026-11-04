import { BadRequestException, ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Negocio } from './negocio.entity';
import { CrearNegocioDto, ActualizarNegocioDto } from './dto';
import { Usuario } from '../usuarios/usuario.entity';
import { CATEGORIAS_ANTERIORES, subcategoriaValida } from './categorias';
import { CENTRO, NEGOCIOS_EJEMPLO } from './negocios.seed';

const img = (n: number) => `https://picsum.photos/seed/divika${n}/300/400`;

@Injectable()
export class NegociosService implements OnModuleInit {
  constructor(@InjectRepository(Negocio) private repo: Repository<Negocio>) {}

  async onModuleInit() {
    // Bases creadas con la primera lista de categorías: las pasamos a su equivalente actual
    for (const [viejo, nuevo] of Object.entries(CATEGORIAS_ANTERIORES)) {
      await this.repo.update({ categoria: viejo }, { categoria: nuevo });
    }

    if ((await this.repo.count()) > 0) return;

    const horariosEjemplo = {
      lunes: { apertura: '09:00', cierre: '19:00', cerrado: false },
      martes: { apertura: '09:00', cierre: '19:00', cerrado: false },
      miercoles: { apertura: '09:00', cierre: '19:00', cerrado: false },
      jueves: { apertura: '09:00', cierre: '19:00', cerrado: false },
      viernes: { apertura: '09:00', cierre: '19:00', cerrado: false },
      sabado: { apertura: '10:00', cierre: '15:00', cerrado: false },
      domingo: { apertura: '00:00', cierre: '00:00', cerrado: true },
    };

    await this.repo.save(
      NEGOCIOS_EJEMPLO.map(([nombre, categoria, subcategoria, calificacion, km], i) =>
        this.repo.create({
          nombre,
          categoria,
          subcategoria,
          telefono: `618${String(1000000 + i * 1373).slice(0, 7)}`,
          direccion: `Av. 20 de Noviembre ${100 + i * 7}`,
          calificacion,
          // Hacia el norte o hacia el este del centro, para que la distancia coincida con la del diseño
          latitud: CENTRO.lat + (i % 2 === 0 ? km / 111 : 0),
          longitud: CENTRO.lng + (i % 2 === 1 ? km / (111 * Math.cos((CENTRO.lat * Math.PI) / 180)) : 0),
          horariosJson: horariosEjemplo,
          imagenUrl: img(i + 1),
        }),
      ),
    );
  }

  async listar(f: {
    buscar?: string;
    categoria?: string;
    subcategoria?: string;
    orden?: 'calificacion' | 'distancia';
    lat?: number;
    lng?: number;
  }) {
    const qb = this.repo.createQueryBuilder('n').where("n.estado = 'publicado'").orderBy('n.calificacion', 'DESC').addOrderBy('n.nombre', 'ASC');
    if (f.buscar) qb.andWhere('LOWER(n.nombre) LIKE :buscar', { buscar: `%${f.buscar.toLowerCase()}%` });
    if (f.categoria) qb.andWhere('n.categoria = :categoria', { categoria: f.categoria });
    if (f.subcategoria) qb.andWhere('n.subcategoria = :subcategoria', { subcategoria: f.subcategoria });

    const negocios = await qb.getMany();
    const hayUbicacion = Number.isFinite(f.lat) && Number.isFinite(f.lng);
    const conDistancia = negocios.map((n) => ({
      ...n,
      distanciaKm:
        hayUbicacion && n.latitud !== null && n.longitud !== null
          ? this.calcularDistanciaHaversine(f.lat as number, f.lng as number, n.latitud, n.longitud)
          : null,
    }));
    if (f.orden === 'distancia' && hayUbicacion) {
      conDistancia.sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
    }
    return conDistancia;
  }

  top(cantidad = 10) {
    return this.repo.find({ where: { estado: 'publicado' }, order: { calificacion: 'DESC' }, take: cantidad });
  }

  // Uso interno: devuelve la entidad completa (con dueño) para validar permisos y guardar
  private async cargar(id: number) {
    const negocio = await this.repo.findOne({ where: { id }, relations: ['owner'] });
    if (!negocio) throw new NotFoundException('Negocio no encontrado');
    return negocio;
  }

  // Uso público: solo expone id y nombre del dueño (nunca el hash ni el correo)
  async uno(id: number) {
    const negocio = await this.cargar(id);
    return { ...negocio, owner: negocio.owner ? { id: negocio.owner.id, nombre: negocio.owner.nombre } : null };
  }

  async crear(dto: CrearNegocioDto, owner?: Usuario) {
    if (!subcategoriaValida(dto.categoria, dto.subcategoria)) {
      throw new BadRequestException('Esa subcategoría no pertenece a la categoría elegida');
    }
    const nuevoNegocio = this.repo.create({
      ...dto,
      owner: owner || null,
      imagenUrl: img(Math.floor(Math.random() * 8) + 1),
    });
    return await this.repo.save(nuevoNegocio);
  }

  async actualizar(id: number, dto: ActualizarNegocioDto, userId?: number) {
    const negocio = await this.cargar(id);

    if (userId && negocio.owner && negocio.owner.id !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar este negocio');
    }

    if (!subcategoriaValida(dto.categoria ?? negocio.categoria, dto.subcategoria ?? negocio.subcategoria)) {
      throw new BadRequestException('Esa subcategoría no pertenece a la categoría elegida');
    }
    Object.assign(negocio, dto);
    return await this.repo.save(negocio);
  }

  async eliminar(id: number, userId?: number) {
    const negocio = await this.cargar(id);

    if (userId && negocio.owner && negocio.owner.id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este negocio');
    }

    await this.repo.remove(negocio);
    return { mensaje: 'Negocio eliminado correctamente' };
  }

  async listarCercanos(lat: number, lng: number, radioKm = 10) {
    const negocios = await this.repo.find({ where: { estado: 'publicado' } });

    return negocios
      .map((negocio) => {
        let distanciaKm: number | null = null;
        if (negocio.latitud !== null && negocio.longitud !== null) {
          distanciaKm = this.calcularDistanciaHaversine(lat, lng, negocio.latitud, negocio.longitud);
        }
        return { ...negocio, distanciaKm };
      })
      .filter((n) => n.distanciaKm === null || n.distanciaKm <= radioKm)
      .sort((a, b) => (a.distanciaKm ?? 9999) - (b.distanciaKm ?? 9999));
  }

  private calcularDistanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  async registrarClicWhatsapp(id: number) {
    const negocio = await this.cargar(id);
    negocio.clicsWhatsapp += 1;
    return await this.repo.save(negocio);
  }

  async registrarClicLlamada(id: number) {
    const negocio = await this.cargar(id);
    negocio.clicsLlamada += 1;
    return await this.repo.save(negocio);
  }

  async actualizarFotos(id: number, imagenUrl?: string, galeria?: string[], userId?: number) {
    const negocio = await this.cargar(id);

    if (userId && negocio.owner && negocio.owner.id !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar las fotos de este negocio');
    }

    if (imagenUrl) negocio.imagenUrl = imagenUrl;
    if (galeria) negocio.galeria = galeria;

    return await this.repo.save(negocio);
  }

  async listarPorPropietario(userId: number) {
    return await this.repo.find({
      where: { owner: { id: userId } },
      order: { creadoEn: 'DESC' },
    });
  }
}

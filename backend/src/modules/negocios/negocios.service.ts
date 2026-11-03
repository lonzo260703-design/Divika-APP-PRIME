import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Negocio } from './negocio.entity';
import { CrearNegocioDto, ActualizarNegocioDto } from './dto';
import { Usuario } from '../usuarios/usuario.entity';

const img = (n: number) => `https://picsum.photos/seed/divika${n}/300/400`;

@Injectable()
export class NegociosService implements OnModuleInit {
  constructor(@InjectRepository(Negocio) private repo: Repository<Negocio>) {}

  async onModuleInit() {
    if ((await this.repo.count()) > 0) return;
    const ejemplos = [
      ['Salón Estilo', 'estetica', '4421112233', 'Av. Principal 123', 4.5, 24.0277, -104.6532],
      ['Taller Mecánico Rojas', 'autos', '4422223344', 'Calle Hidalgo 45', 4.8, 24.0290, -104.6550],
      ['Gimnasio Fit', 'fitness', '4423334455', 'Blvd. Dolores 89', 4.2, 24.0250, -104.6500],
      ['Laboratorio Médico Central', 'laboratorios', '4424445566', 'Calle 5 de Mayo 10', 4.9, 24.0300, -104.6600],
      ['Cafetería La Hoja', 'alimentos', '4425556677', 'Calle Morelos 7', 4.6, 24.0260, -104.6520],
      ['Cel Express', 'tecnologia', '4426667788', 'Av. Juárez 300', 4.1, 24.0280, -104.6540],
      ['Ferretería El Clavo', 'hogar', '4427778899', 'Calle Allende 22', 4.3, 24.0310, -104.6480],
      ['Spa Equilibrio', 'bienestar', '4428889900', 'Av. Reforma 150', 4.7, 24.0240, -104.6580],
    ] as const;

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
      ejemplos.map(([nombre, categoria, telefono, direccion, calificacion, latitud, longitud], i) =>
        this.repo.create({
          nombre,
          categoria,
          telefono,
          direccion,
          calificacion,
          latitud,
          longitud,
          horariosJson: horariosEjemplo,
          imagenUrl: img(i + 1),
        }),
      ),
    );
  }

  listar(buscar?: string, categoria?: string) {
    const qb = this.repo.createQueryBuilder('n').orderBy('n.calificacion', 'DESC');
    if (buscar) qb.andWhere('LOWER(n.nombre) LIKE :buscar', { buscar: `%${buscar.toLowerCase()}%` });
    if (categoria) qb.andWhere('n.categoria = :categoria', { categoria });
    return qb.getMany();
  }

  top(cantidad = 10) {
    return this.repo.find({ order: { calificacion: 'DESC' }, take: cantidad });
  }

  async uno(id: number) {
    const negocio = await this.repo.findOne({ where: { id }, relations: ['owner'] });
    if (!negocio) throw new NotFoundException('Negocio no encontrado');
    return negocio;
  }

  async crear(dto: CrearNegocioDto, owner?: Usuario) {
    const nuevoNegocio = this.repo.create({
      ...dto,
      owner: owner || null,
      imagenUrl: img(Math.floor(Math.random() * 8) + 1),
    });
    return await this.repo.save(nuevoNegocio);
  }

  async actualizar(id: number, dto: ActualizarNegocioDto, userId?: number) {
    const negocio = await this.uno(id);

    if (userId && negocio.owner && negocio.owner.id !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar este negocio');
    }

    Object.assign(negocio, dto);
    return await this.repo.save(negocio);
  }

  async eliminar(id: number, userId?: number) {
    const negocio = await this.uno(id);

    if (userId && negocio.owner && negocio.owner.id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este negocio');
    }

    await this.repo.remove(negocio);
    return { mensaje: 'Negocio eliminado correctamente' };
  }

  async listarCercanos(lat: number, lng: number, radioKm = 10) {
    const negocios = await this.repo.find();
    
    return negocios
      .map((negocio) => {
        let distanciaKm = null;
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
    const negocio = await this.uno(id);
    negocio.clicsWhatsapp += 1;
    return await this.repo.save(negocio);
  }

  async registrarClicLlamada(id: number) {
    const negocio = await this.uno(id);
    negocio.clicsLlamada += 1;
    return await this.repo.save(negocio);
  }

  async actualizarFotos(id: number, imagenUrl?: string, galeria?: string[], userId?: number) {
    const negocio = await this.uno(id);

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

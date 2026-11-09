import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './resena.entity';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CrearResenaDto } from './dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena) private repo: Repository<Resena>,
    @InjectRepository(Negocio) private negocioRepo: Repository<Negocio>,
    @InjectRepository(Usuario) private usuarios: Repository<Usuario>,
    private avisos: NotificacionesService,
  ) {}

  // Listar todas las reseñas de un negocio específico
  async listarPorNegocio(negocioId: number) {
    const resenas = await this.repo.find({
      where: { negocio: { id: negocioId } },
      relations: ['usuario'],
      order: { creadoEn: 'DESC' },
    });
    // Solo exponemos id y nombre del autor (nunca el hash ni el correo)
    return resenas.map((r) => ({ ...r, usuario: { id: r.usuario.id, nombre: r.usuario.nombre } }));
  }

  // Crear una nueva reseña/calificación y actualizar el promedio del negocio
  async crear(usuarioId: number, dto: CrearResenaDto) {
    const negocio = await this.negocioRepo.findOneBy({ id: dto.negocioId });
    if (!negocio) throw new NotFoundException('Negocio no encontrado');

    // Crear y guardar la reseña asegurando que el usuario es válido
    const resena = this.repo.create({
      calificacion: dto.calificacion,
      comentario: dto.comentario,
      usuario: { id: usuarioId } as Usuario,
      negocio: { id: dto.negocioId } as Negocio,
    });

    const guardada = await this.repo.save(resena);

    // Recalcular el promedio de calificación del negocio
    await this.actualizarCalificacionPromedio(dto.negocioId);
    const autor = await this.usuarios.findOne({ where: { id: usuarioId }, select: { id: true, nombre: true } });
    await this.avisos.avisarAlDueno(dto.negocioId, { tipo: 'resena', titulo: `${autor?.nombre ?? 'Un cliente'} dejó una reseña de ${dto.calificacion} estrellas`, detalle: dto.comentario, enlace: '/portal/resenas' });

    return guardada;
  }

  private async actualizarCalificacionPromedio(negocioId: number) {
    const resenas = await this.repo.find({ where: { negocio: { id: negocioId } } });
    if (resenas.length === 0) return;

    const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    const promedio = Number((suma / resenas.length).toFixed(1));

    await this.negocioRepo.update(negocioId, { calificacion: promedio });
  }
}

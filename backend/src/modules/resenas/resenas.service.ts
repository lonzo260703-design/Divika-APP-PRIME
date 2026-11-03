import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './resena.entity';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CrearResenaDto } from './dto';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena) private repo: Repository<Resena>,
    @InjectRepository(Negocio) private negocioRepo: Repository<Negocio>,
  ) {}

  // Listar todas las reseñas de un negocio específico
  async listarPorNegocio(negocioId: number) {
    return await this.repo.find({
      where: { negocio: { id: negocioId } },
      relations: ['usuario'],
      order: { creadoEn: 'DESC' },
    });
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from './favorito.entity';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito) private repo: Repository<Favorito>,
    @InjectRepository(Negocio) private negocioRepo: Repository<Negocio>,
  ) {}

  // Devuelve los negocios favoritos del usuario, el más reciente primero
  async listar(usuarioId: number) {
    const favoritos = await this.repo.find({
      where: { usuario: { id: usuarioId } },
      relations: ['negocio'],
      order: { creadoEn: 'DESC' },
    });
    return favoritos.map((f) => f.negocio);
  }

  // Idempotente: marcar dos veces el mismo negocio no falla ni duplica
  async agregar(usuarioId: number, negocioId: number) {
    if (!(await this.negocioRepo.existsBy({ id: negocioId }))) {
      throw new NotFoundException('Negocio no encontrado');
    }
    const existe = await this.repo.existsBy({ usuario: { id: usuarioId }, negocio: { id: negocioId } });
    if (!existe) {
      await this.repo.save(
        this.repo.create({ usuario: { id: usuarioId } as Usuario, negocio: { id: negocioId } as Negocio }),
      );
    }
    return { favorito: true };
  }

  async quitar(usuarioId: number, negocioId: number) {
    await this.repo.delete({ usuario: { id: usuarioId }, negocio: { id: negocioId } });
    return { favorito: false };
  }
}

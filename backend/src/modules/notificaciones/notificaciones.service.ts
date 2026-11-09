import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Notificacion, TipoNotificacion } from './notificacion.entity';

type Aviso = { tipo: TipoNotificacion; titulo: string; detalle?: string; enlace?: string };

@Injectable()
export class NotificacionesService {
  private log = new Logger('Notificaciones');
  constructor(
    @InjectRepository(Notificacion) private repo: Repository<Notificacion>,
    @InjectRepository(Negocio) private negocios: Repository<Negocio>,
  ) {}

  // Nunca debe romper la acción que la origina
  async avisar(usuarioId: number, a: Aviso) {
    try {
      await this.repo.save(this.repo.create({ usuario: { id: usuarioId } as Usuario, tipo: a.tipo, titulo: a.titulo, detalle: a.detalle?.slice(0, 160) ?? null, enlace: a.enlace ?? null }));
    } catch (e) {
      this.log.warn(`No se pudo guardar el aviso: ${(e as Error).message}`);
    }
  }

  async avisarAlDueno(negocioId: number, a: Aviso) {
    const n = await this.negocios.findOne({ where: { id: negocioId }, relations: { owner: true } });
    if (n?.owner) await this.avisar(n.owner.id, a);
  }

  async listar(usuarioId: number) {
    const items = await this.repo.find({ where: { usuario: { id: usuarioId } }, order: { creadoEn: 'DESC', id: 'DESC' }, take: 100 });
    return { noLeidas: items.filter((i) => !i.leida).length, items: items.map(({ usuario, ...r }) => r) };
  }

  async leer(usuarioId: number, id: number) {
    const r = await this.repo.update({ id, usuario: { id: usuarioId } }, { leida: true });
    if (!r.affected) throw new NotFoundException('Aviso no encontrado');
    return { ok: true };
  }

  async leerTodas(usuarioId: number) {
    await this.repo.update({ usuario: { id: usuarioId }, leida: false }, { leida: true });
    return { ok: true };
  }
}

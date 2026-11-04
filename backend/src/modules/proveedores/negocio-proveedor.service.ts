import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { subcategoriaValida } from '../negocios/categorias';
import { Negocio } from '../negocios/negocio.entity';
import { ActualizarPerfilDto } from './negocio-proveedor.dto';

export const MAX_FOTOS = 10;
export const CARPETA_FOTOS = join(process.cwd(), 'uploads');

// "Mi negocio" del proveedor con sesión: todo opera sobre el negocio del que es dueño
@Injectable()
export class NegocioProveedorService {
  constructor(@InjectRepository(Negocio) private repo: Repository<Negocio>) {}

  private async mio(userId: number) {
    const negocio = await this.repo.findOne({ where: { owner: { id: userId } }, order: { creadoEn: 'ASC' } });
    if (!negocio) throw new ForbiddenException('Tu cuenta no tiene un negocio');
    return negocio;
  }

  obtener(userId: number) {
    return this.mio(userId);
  }

  async actualizar(userId: number, dto: ActualizarPerfilDto) {
    const negocio = await this.mio(userId);
    const categoria = dto.categoria ?? negocio.categoria;
    // Si cambia de categoría sin elegir subcategoría, la anterior ya no aplica
    const subcategoria = dto.subcategoria !== undefined ? dto.subcategoria || null : dto.categoria ? null : negocio.subcategoria;
    if (!subcategoriaValida(categoria, subcategoria ?? undefined)) {
      throw new BadRequestException('Esa subcategoría no pertenece a la categoría elegida');
    }
    Object.assign(negocio, dto, { subcategoria });
    if (dto.ciudad !== undefined || dto.colonia !== undefined) {
      negocio.direccion = [negocio.colonia, negocio.ciudad].filter(Boolean).join(', ') || negocio.direccion;
    }
    // Vacío = sin valor
    if (dto.whatsapp === '') negocio.whatsapp = null;
    return this.repo.save(negocio);
  }

  // Lo mínimo para salir en el directorio
  private faltantes(n: Negocio) {
    const f: string[] = [];
    if (!n.nombre?.trim()) f.push('el nombre del negocio');
    if (!n.descripcion?.trim()) f.push('la descripción');
    if (!n.telefono?.trim()) f.push('el teléfono');
    if (!n.galeria?.length) f.push('al menos una foto');
    return f;
  }

  async publicar(userId: number) {
    const negocio = await this.mio(userId);
    const f = this.faltantes(negocio);
    if (f.length) throw new UnprocessableEntityException(`Antes de publicar agrega: ${f.join(', ')}.`);
    negocio.estado = 'publicado';
    if (!negocio.calificacion) negocio.calificacion = 5;
    return this.repo.save(negocio);
  }

  async pausar(userId: number) {
    const negocio = await this.mio(userId);
    if (negocio.estado !== 'publicado') throw new BadRequestException('Solo puedes pausar un perfil publicado');
    negocio.estado = 'pausado';
    return this.repo.save(negocio);
  }

  // La primera foto de la galería es la portada
  private async guardarGaleria(negocio: Negocio, galeria: string[]) {
    negocio.galeria = galeria;
    negocio.imagenUrl = galeria[0] ?? null;
    return this.repo.save(negocio);
  }

  async agregarFoto(userId: number, url: string) {
    const negocio = await this.mio(userId);
    const galeria = negocio.galeria ?? [];
    if (galeria.length >= MAX_FOTOS) throw new BadRequestException(`Máximo ${MAX_FOTOS} fotos`);
    return this.guardarGaleria(negocio, [...galeria, url]);
  }

  async ordenarFotos(userId: number, orden: number[]) {
    const negocio = await this.mio(userId);
    const galeria = negocio.galeria ?? [];
    const valido = orden.length === galeria.length && [...orden].sort().every((v, i) => v === i);
    if (!valido) throw new BadRequestException('El orden de las fotos no es válido');
    return this.guardarGaleria(negocio, orden.map((i) => galeria[i]));
  }

  async quitarFoto(userId: number, indice: number) {
    const negocio = await this.mio(userId);
    const galeria = [...(negocio.galeria ?? [])];
    if (indice < 0 || indice >= galeria.length) throw new NotFoundException('Foto no encontrada');
    const [quitada] = galeria.splice(indice, 1);
    // Si la foto estaba en nuestra carpeta, también se borra el archivo
    const archivo = quitada.split('/uploads/')[1];
    if (archivo && !archivo.includes('/') && !archivo.includes('..')) await unlink(join(CARPETA_FOTOS, archivo)).catch(() => {});
    return this.guardarGaleria(negocio, galeria);
  }
}

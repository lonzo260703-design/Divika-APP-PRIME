import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { ahoraLocal } from '../agenda/disponibilidad';
import { subcategoriaValida } from '../negocios/categorias';
import { Negocio } from '../negocios/negocio.entity';
import { ActualizarPerfilDto } from './negocio-proveedor.dto';

export const MAX_FOTOS = 10;
export const CARPETA_FOTOS = join(process.cwd(), 'uploads');

// "Mi negocio" del proveedor con sesión: todo opera sobre el negocio del que es dueño
@Injectable()
export class NegocioProveedorService {
  constructor(@InjectRepository(Negocio) private repo: Repository<Negocio>) {}

  private async mio(userId: number, privados = false) {
    const q = this.repo.createQueryBuilder('n').leftJoin('n.owner', 'o').where('o.id = :userId', { userId }).orderBy('n.creadoEn', 'ASC');
    if (privados) q.addSelect(['n.instruccionesPago', 'n.visitasPorDia']);
    const negocio = await q.getOne();
    if (!negocio) throw new ForbiddenException('Tu cuenta no tiene un negocio');
    return negocio;
  }

  async obtener(userId: number) {
    const n = await this.mio(userId, true);
    return this.salida(n);
  }

  // Quita el historial de visitas del perfil (se consulta en /estadisticas)
  private salida(n: Negocio) {
    const { visitasPorDia, ...resto } = n;
    void visitasPorDia;
    return resto;
  }

  // Visitas al perfil: últimos 14 días y comparación con los 7 anteriores
  async estadisticas(userId: number) {
    const n = await this.mio(userId, true);
    const dias = n.visitasPorDia ?? {};
    const serie: { fecha: string; total: number }[] = [];
    const hoy = new Date(`${ahoraLocal().fecha}T12:00:00Z`);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(hoy);
      d.setUTCDate(d.getUTCDate() - i);
      const f = d.toISOString().slice(0, 10);
      serie.push({ fecha: f, total: dias[f] ?? 0 });
    }
    const suma = (l: { total: number }[]) => l.reduce((a, x) => a + x.total, 0);
    return { serie, visitas7: suma(serie.slice(7)), visitasPrevias7: suma(serie.slice(0, 7)) };
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
    if (dto.ciudad !== undefined || dto.colonia !== undefined || dto.calle !== undefined) {
      negocio.direccion = [negocio.calle, negocio.colonia, negocio.ciudad].filter(Boolean).join(', ') || negocio.direccion;
    }
    if (dto.calle === '') negocio.calle = null;
    if (dto.referencias === '') negocio.referencias = null;
    if (dto.instruccionesPago === '') negocio.instruccionesPago = null;
    if (dto.atiendeDomicilio === false) {
      // Sin domicilio, los servicios a domicilio pasan a ser solo en el negocio
      await this.repo.manager.query("UPDATE servicios SET modalidad = 'local', costoTraslado = NULL WHERE negocioId = ? AND modalidad != 'local'", [negocio.id]);
    }
    // Vacío = sin valor
    if (dto.whatsapp === '') negocio.whatsapp = null;
    await this.repo.save(negocio);
    return this.obtener(userId);
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

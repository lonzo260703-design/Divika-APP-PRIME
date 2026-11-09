import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Favorito } from '../favoritos/favorito.entity';
import { Resena } from '../resenas/resena.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CambiarContrasenaDto, ActualizarCuentaDto, PreferenciasDto, ReporteDto } from './dto';
import { conIniciales } from './preferencias';
import { ReporteProblema } from './reporte.entity';

export const CARPETA_AVATARES = join(process.cwd(), 'uploads');

// Cuenta del usuario con sesión: perfil, contraseña, teléfono, preferencias, datos y baja
@Injectable()
export class CuentaService {
  constructor(
    @InjectRepository(Usuario) private repo: Repository<Usuario>,
    @InjectRepository(Resena) private resenas: Repository<Resena>,
    @InjectRepository(Favorito) private favoritos: Repository<Favorito>,
    @InjectRepository(ReporteProblema) private reportes: Repository<ReporteProblema>,
    private auth: AuthService,
  ) {}

  private async usuario(id: number) {
    const u = await this.repo.findOneBy({ id });
    if (!u) throw new UnauthorizedException('Usuario no encontrado');
    return u;
  }

  // Nunca incluye passwordHash ni los datos del código de verificación
  private vista(u: Usuario) {
    return {
      id: u.id, nombre: u.nombre, apellidos: u.apellidos, email: u.email, rol: u.rol,
      telefono: u.telefono, telefonoVerificado: u.telefonoVerificado,
      fechaNacimiento: u.fechaNacimiento, ciudad: u.ciudad, avatarUrl: u.avatarUrl,
      tienePassword: !!u.passwordHash, preferencias: conIniciales(u.preferencias), creadoEn: u.creadoEn,
    };
  }

  async obtener(id: number) {
    return this.vista(await this.usuario(id));
  }

  async actualizar(id: number, dto: ActualizarCuentaDto) {
    const u = await this.usuario(id);
    if (dto.email && dto.email.toLowerCase() !== u.email) {
      if (await this.repo.findOneBy({ email: dto.email.toLowerCase() })) throw new ConflictException('Ese correo ya está registrado');
      u.email = dto.email.toLowerCase();
    }
    if (dto.nombre !== undefined) u.nombre = dto.nombre.trim();
    if (dto.fechaNacimiento !== undefined) u.fechaNacimiento = dto.fechaNacimiento || null;
    if (dto.ciudad !== undefined) u.ciudad = dto.ciudad.trim() || null;
    return this.vista(await this.repo.save(u));
  }

  private async borrarArchivo(url: string | null) {
    const archivo = url?.split('/uploads/')[1];
    if (archivo && !archivo.includes('/') && !archivo.includes('..')) await unlink(join(CARPETA_AVATARES, archivo)).catch(() => {});
  }

  async cambiarFoto(id: number, url: string | null) {
    const u = await this.usuario(id);
    const anterior = u.avatarUrl;
    u.avatarUrl = url;
    const guardado = await this.repo.save(u);
    await this.borrarArchivo(anterior);
    return this.vista(guardado);
  }

  async cambiarContrasena(id: number, dto: CambiarContrasenaDto) {
    const u = await this.usuario(id);
    if (!u.passwordHash) throw new BadRequestException('Tu cuenta entra con Google o Apple y no tiene contraseña');
    if (!(await bcrypt.compare(dto.actual, u.passwordHash))) throw new BadRequestException('La contraseña actual no es correcta');
    if (await bcrypt.compare(dto.nueva, u.passwordHash)) throw new BadRequestException('La contraseña nueva debe ser distinta a la actual');
    u.passwordHash = await bcrypt.hash(dto.nueva, 10);
    await this.repo.save(u);
    return { ok: true };
  }

  // Cambiar teléfono: el número nuevo queda pendiente y solo reemplaza al actual al confirmar el código
  async pedirCodigoTelefono(id: number, telefonoCrudo: string) {
    const u = await this.usuario(id);
    const telefono = this.auth.normalizarTelefono(telefonoCrudo);
    if (telefono === u.telefono && u.telefonoVerificado) throw new BadRequestException('Ese ya es tu número verificado');
    const dueno = await this.repo.findOneBy({ telefono });
    if (dueno && dueno.id !== id) throw new ConflictException('Ese teléfono ya está registrado');
    u.telefonoPendiente = telefono;
    await this.repo.save(u);
    await this.auth.emitirCodigo(u, telefono);
    return { enviado: true, segundosEspera: 60 };
  }

  async verificarTelefono(id: number, telefonoCrudo: string, codigo: string) {
    const u = await this.usuario(id);
    const telefono = this.auth.normalizarTelefono(telefonoCrudo);
    if (!u.telefonoPendiente || u.telefonoPendiente !== telefono) throw new BadRequestException('Primero solicita un código para ese número');
    await this.auth.comprobarCodigo(u, codigo);
    u.telefono = telefono;
    u.telefonoVerificado = true;
    u.telefonoPendiente = null;
    return this.vista(await this.repo.save(u));
  }

  async preferencias(id: number) {
    return conIniciales((await this.usuario(id)).preferencias);
  }

  // Solo cambia las claves conocidas y booleanas; lo demás se ignora
  async guardarPreferencias(id: number, dto: PreferenciasDto) {
    const u = await this.usuario(id);
    const actuales = conIniciales(u.preferencias);
    for (const grupo of ['notificaciones', 'privacidad'] as const) {
      const nuevas = dto[grupo] ?? {};
      for (const clave of Object.keys(actuales[grupo]) as (keyof (typeof actuales)[typeof grupo])[]) {
        if (typeof nuevas[clave as string] === 'boolean') (actuales[grupo] as Record<string, boolean>)[clave as string] = nuevas[clave as string];
      }
    }
    u.preferencias = actuales;
    await this.repo.save(u);
    return actuales;
  }

  // "Descargar mis datos": una copia de lo que Divika guarda de la persona
  async exportarDatos(id: number) {
    const u = await this.usuario(id);
    const resenas = await this.resenas.find({ where: { usuario: { id } }, relations: { negocio: true } });
    const favoritos = await this.favoritos.find({ where: { usuario: { id } }, relations: { negocio: true } });
    return {
      exportadoEn: new Date().toISOString(),
      cuenta: this.vista(u),
      resenas: resenas.map((r) => ({ negocio: r.negocio.nombre, calificacion: r.calificacion, comentario: r.comentario, creadoEn: r.creadoEn })),
      favoritos: favoritos.map((f) => ({ negocio: f.negocio.nombre, guardadoEn: f.creadoEn })),
    };
  }

  // Borra la cuenta; sus reseñas y favoritos se borran en cascada
  async eliminar(id: number) {
    const u = await this.usuario(id);
    if (u.rol === 'negocio') throw new ForbiddenException('Las cuentas de proveedor se dan de baja escribiendo a soporte');
    await this.repo.delete(id);
    await this.borrarArchivo(u.avatarUrl);
    return { ok: true };
  }

  async reportar(id: number, dto: ReporteDto) {
    const u = await this.usuario(id);
    await this.reportes.save(this.reportes.create({ tipo: dto.tipo, descripcion: dto.descripcion.trim(), usuario: u }));
    return { ok: true };
  }
}

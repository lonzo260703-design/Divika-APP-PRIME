import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';
import { Resena } from '../resenas/resena.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Cita } from './cita.entity';
import { CrearCitaDto, MensajeDto, ProponerHorarioDto, ServicioDto } from './dto';
import { Mensaje } from './mensaje.entity';
import { Servicio } from './servicio.entity';

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Nunca se devuelve el usuario completo (traería el hash de la contraseña)
const salida = (c: Cita) => ({
  id: c.id,
  estado: c.estado,
  fecha: c.fecha,
  hora: c.hora,
  personas: c.personas,
  notas: c.notas,
  metodoPago: c.metodoPago,
  propuestaFecha: c.propuestaFecha,
  propuestaHora: c.propuestaHora,
  creadoEn: c.creadoEn,
  servicio: c.servicio ? { id: c.servicio.id, nombre: c.servicio.nombre, precio: c.servicio.precio, duracionMin: c.servicio.duracionMin } : null,
  negocio: { id: c.negocio.id, nombre: c.negocio.nombre, imagenUrl: c.negocio.imagenUrl, direccion: c.negocio.direccion, telefono: c.negocio.telefono },
  cliente: { id: c.cliente.id, nombre: c.cliente.nombre, telefono: c.cliente.telefono },
});

// Servicios, citas y mensajes entre clientes y negocios
@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Servicio) private servicios: Repository<Servicio>,
    @InjectRepository(Cita) private citas: Repository<Cita>,
    @InjectRepository(Mensaje) private mensajes: Repository<Mensaje>,
    @InjectRepository(Negocio) private negocios: Repository<Negocio>,
    @InjectRepository(Resena) private resenas: Repository<Resena>,
  ) {}

  private async negocioDe(userId: number) {
    const n = await this.negocios.findOne({ where: { owner: { id: userId } }, order: { creadoEn: 'ASC' } });
    if (!n) throw new ForbiddenException('Tu cuenta no tiene un negocio');
    return n;
  }

  // ---------- Servicios ----------
  serviciosPublicos(negocioId: number) {
    return this.servicios.find({ where: { negocio: { id: negocioId }, activo: true }, order: { creadoEn: 'ASC' } });
  }

  async serviciosMios(userId: number) {
    const n = await this.negocioDe(userId);
    return this.servicios.find({ where: { negocio: { id: n.id } }, order: { creadoEn: 'ASC' } });
  }

  async crearServicio(userId: number, dto: ServicioDto) {
    const n = await this.negocioDe(userId);
    return this.servicios.save(this.servicios.create({ ...dto, descripcion: dto.descripcion ?? null, precio: dto.precio ?? null, activo: dto.activo ?? true, negocio: n }));
  }

  private async servicioMio(userId: number, id: number) {
    const n = await this.negocioDe(userId);
    const s = await this.servicios.findOne({ where: { id, negocio: { id: n.id } } });
    if (!s) throw new NotFoundException('Servicio no encontrado');
    return s;
  }

  async actualizarServicio(userId: number, id: number, dto: ServicioDto) {
    const s = await this.servicioMio(userId, id);
    Object.assign(s, { ...dto, descripcion: dto.descripcion ?? null, precio: dto.precio ?? null, activo: dto.activo ?? s.activo });
    return this.servicios.save(s);
  }

  async borrarServicio(userId: number, id: number) {
    await this.servicios.remove(await this.servicioMio(userId, id));
    return { ok: true };
  }

  // ---------- Citas ----------
  private async hayChoque(negocioId: number, fecha: string, hora: string, ignorarId?: number) {
    const c = await this.citas.find({ where: { negocio: { id: negocioId }, fecha, hora, estado: 'confirmada' } });
    return c.some((x) => x.id !== ignorarId);
  }

  async horasOcupadas(negocioId: number, fecha: string) {
    const c = await this.citas.find({ where: { negocio: { id: negocioId }, fecha, estado: 'confirmada' } });
    return { fecha, ocupadas: c.map((x) => x.hora) };
  }

  async crearCita(clienteId: number, dto: CrearCitaDto) {
    const negocio = await this.negocios.findOneBy({ id: dto.negocioId });
    if (!negocio || negocio.estado !== 'publicado') throw new NotFoundException('Negocio no encontrado');
    if (dto.fecha < hoy()) throw new BadRequestException('Elige una fecha de hoy en adelante');
    let servicio: Servicio | null = null;
    if (dto.servicioId) {
      servicio = await this.servicios.findOne({ where: { id: dto.servicioId, negocio: { id: negocio.id }, activo: true } });
      if (!servicio) throw new BadRequestException('Ese servicio no existe en este negocio');
    }
    if (dto.metodoPago && negocio.metodosPago?.length && !negocio.metodosPago.includes(dto.metodoPago)) {
      throw new BadRequestException('El negocio no acepta esa forma de pago');
    }
    if (await this.hayChoque(negocio.id, dto.fecha, dto.hora)) throw new ConflictException('Ese horario ya no está disponible');
    const repetida = await this.citas.findOne({ where: { negocio: { id: negocio.id }, cliente: { id: clienteId }, fecha: dto.fecha, hora: dto.hora, estado: 'solicitada' } });
    if (repetida) throw new ConflictException('Ya tienes una solicitud para ese horario');
    const c = await this.citas.save(
      this.citas.create({ negocio, cliente: { id: clienteId } as Usuario, servicio, fecha: dto.fecha, hora: dto.hora, personas: dto.personas, notas: dto.notas ?? null, metodoPago: dto.metodoPago ?? null, estado: 'solicitada' }),
    );
    return salida(await this.citas.findOneByOrFail({ id: c.id }));
  }

  async citasDelCliente(clienteId: number) {
    const l = await this.citas.find({ where: { cliente: { id: clienteId } }, order: { fecha: 'DESC', hora: 'DESC' } });
    return l.map(salida);
  }

  async citasDelNegocio(userId: number) {
    const n = await this.negocioDe(userId);
    const l = await this.citas.find({ where: { negocio: { id: n.id } }, order: { fecha: 'ASC', hora: 'ASC' } });
    return l.map(salida);
  }

  private async citaDelNegocio(userId: number, id: number) {
    const n = await this.negocioDe(userId);
    const c = await this.citas.findOne({ where: { id, negocio: { id: n.id } } });
    if (!c) throw new NotFoundException('Cita no encontrada');
    return c;
  }

  async confirmar(userId: number, id: number) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.estado !== 'solicitada') throw new BadRequestException('Solo puedes confirmar una solicitud pendiente');
    if (await this.hayChoque(c.negocio.id, c.fecha, c.hora, c.id)) throw new ConflictException('Ya tienes una cita confirmada en ese horario');
    c.estado = 'confirmada';
    return salida(await this.citas.save(c));
  }

  async rechazar(userId: number, id: number) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.estado !== 'solicitada') throw new BadRequestException('Solo puedes rechazar una solicitud pendiente');
    c.estado = 'rechazada';
    return salida(await this.citas.save(c));
  }

  async proponer(userId: number, id: number, dto: ProponerHorarioDto) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.estado !== 'solicitada') throw new BadRequestException('Solo puedes proponer otro horario en una solicitud pendiente');
    if (dto.fecha < hoy()) throw new BadRequestException('Elige una fecha de hoy en adelante');
    if (await this.hayChoque(c.negocio.id, dto.fecha, dto.hora, c.id)) throw new ConflictException('Ya tienes una cita confirmada en ese horario');
    c.estado = 'propuesta';
    c.propuestaFecha = dto.fecha;
    c.propuestaHora = dto.hora;
    return salida(await this.citas.save(c));
  }

  async aceptarPropuesta(clienteId: number, id: number) {
    const c = await this.citas.findOne({ where: { id, cliente: { id: clienteId } } });
    if (!c) throw new NotFoundException('Cita no encontrada');
    if (c.estado !== 'propuesta' || !c.propuestaFecha || !c.propuestaHora) throw new BadRequestException('Esta cita no tiene una propuesta pendiente');
    if (await this.hayChoque(c.negocio.id, c.propuestaFecha, c.propuestaHora, c.id)) throw new ConflictException('Ese horario ya no está disponible');
    c.fecha = c.propuestaFecha;
    c.hora = c.propuestaHora;
    c.propuestaFecha = c.propuestaHora = null;
    c.estado = 'confirmada';
    return salida(await this.citas.save(c));
  }

  // Cancela el cliente dueño de la cita o el dueño del negocio
  async cancelar(userId: number, id: number) {
    const c = await this.citas.findOneBy({ id });
    if (!c) throw new NotFoundException('Cita no encontrada');
    const dueno = await this.negocios.findOne({ where: { id: c.negocio.id, owner: { id: userId } } });
    if (c.cliente.id !== userId && !dueno) throw new ForbiddenException('No puedes cancelar esta cita');
    if (!['solicitada', 'confirmada', 'propuesta'].includes(c.estado)) throw new BadRequestException('Esta cita ya no se puede cancelar');
    c.estado = 'cancelada';
    return salida(await this.citas.save(c));
  }

  // ---------- Mensajes ----------
  private resumen(filas: Mensaje[], lado: 'cliente' | 'negocio') {
    const mapa = new Map<number, { con: { id: number; nombre: string; imagenUrl?: string | null }; ultimo: { texto: string; de: string; creadoEn: Date }; sinLeer: number }>();
    for (const m of filas) {
      const otro = lado === 'negocio' ? { id: m.cliente.id, nombre: m.cliente.nombre } : { id: m.negocio.id, nombre: m.negocio.nombre, imagenUrl: m.negocio.imagenUrl };
      const e = mapa.get(otro.id) ?? { con: otro, ultimo: { texto: m.texto, de: m.de, creadoEn: m.creadoEn }, sinLeer: 0 };
      if (!mapa.has(otro.id)) mapa.set(otro.id, e);
      if (!m.leido && m.de !== lado) e.sinLeer += 1;
    }
    return [...mapa.values()];
  }

  async conversacionesCliente(clienteId: number) {
    const f = await this.mensajes.find({ where: { cliente: { id: clienteId } }, relations: ['negocio', 'cliente'], order: { creadoEn: 'DESC', id: 'DESC' } });
    return this.resumen(f, 'cliente');
  }

  async conversacionesNegocio(userId: number) {
    const n = await this.negocioDe(userId);
    const f = await this.mensajes.find({ where: { negocio: { id: n.id } }, relations: ['negocio', 'cliente'], order: { creadoEn: 'DESC', id: 'DESC' } });
    return this.resumen(f, 'negocio');
  }

  private async hilo(negocioId: number, clienteId: number, lector: 'cliente' | 'negocio') {
    const l = await this.mensajes.find({ where: { negocio: { id: negocioId }, cliente: { id: clienteId } }, order: { creadoEn: 'ASC', id: 'ASC' } });
    const nuevos = l.filter((m) => !m.leido && m.de !== lector).map((m) => m.id);
    if (nuevos.length) await this.mensajes.update({ id: In(nuevos) }, { leido: true });
    return l.map((m) => ({ id: m.id, de: m.de, texto: m.texto, creadoEn: m.creadoEn }));
  }

  async hiloCliente(clienteId: number, negocioId: number) {
    return this.hilo(negocioId, clienteId, 'cliente');
  }

  async hiloNegocio(userId: number, clienteId: number) {
    const n = await this.negocioDe(userId);
    return this.hilo(n.id, clienteId, 'negocio');
  }

  async enviarCliente(clienteId: number, negocioId: number, dto: MensajeDto) {
    const n = await this.negocios.findOneBy({ id: negocioId });
    if (!n || n.estado !== 'publicado') throw new NotFoundException('Negocio no encontrado');
    const m = await this.mensajes.save(this.mensajes.create({ negocio: n, cliente: { id: clienteId } as Usuario, de: 'cliente', texto: dto.texto.trim() }));
    return { id: m.id, de: m.de, texto: m.texto, creadoEn: m.creadoEn };
  }

  // El negocio solo responde a clientes que ya le escribieron o le pidieron una cita
  async enviarNegocio(userId: number, clienteId: number, dto: MensajeDto) {
    const n = await this.negocioDe(userId);
    const previo = (await this.mensajes.existsBy({ negocio: { id: n.id }, cliente: { id: clienteId } })) || (await this.citas.existsBy({ negocio: { id: n.id }, cliente: { id: clienteId } }));
    if (!previo) throw new ForbiddenException('Solo puedes responder a clientes que te escribieron o pidieron una cita');
    const m = await this.mensajes.save(this.mensajes.create({ negocio: n, cliente: { id: clienteId } as Usuario, de: 'negocio', texto: dto.texto.trim() }));
    return { id: m.id, de: m.de, texto: m.texto, creadoEn: m.creadoEn };
  }

  // ---------- Reseñas (lado del negocio) ----------
  async resenasMias(userId: number) {
    const n = await this.negocioDe(userId);
    const l = await this.resenas.find({ where: { negocio: { id: n.id } }, relations: ['usuario'], order: { creadoEn: 'DESC' } });
    return l.map((r) => ({ ...r, usuario: { id: r.usuario.id, nombre: r.usuario.nombre } }));
  }

  async responderResena(userId: number, id: number, texto: string) {
    const n = await this.negocioDe(userId);
    const r = await this.resenas.findOne({ where: { id, negocio: { id: n.id } }, relations: ['usuario'] });
    if (!r) throw new NotFoundException('Reseña no encontrada');
    r.respuesta = texto.trim();
    r.respuestaEn = new Date();
    await this.resenas.save(r);
    return { ...r, usuario: { id: r.usuario.id, nombre: r.usuario.nombre } };
  }
}

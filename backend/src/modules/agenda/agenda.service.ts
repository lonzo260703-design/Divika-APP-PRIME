import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Resena } from '../resenas/resena.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Cita } from './cita.entity';
import { CrearCitaDto, MensajeDto, ProponerHorarioDto, ServicioDto } from './dto';
import { Mensaje } from './mensaje.entity';
import { Servicio } from './servicio.entity';
import { DIAS, HORARIO_INICIAL, REGLAS_INICIALES, ahoraLocal, aHora, aMin, horasDelDia, reglasDe } from './disponibilidad';
import { DisponibilidadDto } from './dto';

const hoy = () => ahoraLocal().fecha;
const fCorta = (f: string) => new Date(`${f}T12:00:00Z`).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

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
    private avisos: NotificacionesService,
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

  private datosServicio(n: Negocio, dto: ServicioDto) {
    const modalidad = dto.modalidad ?? 'local';
    if (modalidad !== 'local' && !n.atiendeDomicilio) {
      throw new BadRequestException('Para ofrecer servicio a domicilio activa “Atiendo a domicilio” en Ubicación y cobertura');
    }
    return {
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      precio: dto.precio ?? null,
      duracionMin: dto.duracionMin,
      categoria: dto.categoria?.trim() || null,
      modalidad,
      costoTraslado: modalidad === 'local' ? null : dto.costoTraslado ?? null,
      indicaciones: dto.indicaciones?.trim() || null,
    } as const;
  }

  async crearServicio(userId: number, dto: ServicioDto) {
    const n = await this.negocioDe(userId);
    return this.servicios.save(this.servicios.create({ ...this.datosServicio(n, dto), activo: dto.activo ?? true, negocio: n }));
  }

  private async servicioMio(userId: number, id: number) {
    const n = await this.negocioDe(userId);
    const s = await this.servicios.findOne({ where: { id, negocio: { id: n.id } } });
    if (!s) throw new NotFoundException('Servicio no encontrado');
    return s;
  }

  async actualizarServicio(userId: number, id: number, dto: ServicioDto) {
    const s = await this.servicioMio(userId, id);
    const n = await this.negocioDe(userId);
    Object.assign(s, this.datosServicio(n, dto), { activo: dto.activo ?? s.activo });
    return this.servicios.save(s);
  }

  async fotoServicio(userId: number, id: number, url: string | null) {
    const s = await this.servicioMio(userId, id);
    s.fotoUrl = url;
    return this.servicios.save(s);
  }

  async borrarServicio(userId: number, id: number) {
    await this.servicios.remove(await this.servicioMio(userId, id));
    return { ok: true };
  }

  // ---------- Citas ----------
  private duracionDe(c: Cita, n: Negocio) {
    return c.servicio?.duracionMin ?? reglasDe(n).duracionBase;
  }

  // ¿Se encima con una cita ya confirmada?
  private async hayChoque(negocio: Negocio, fecha: string, hora: string, dur: number, ignorarId?: number) {
    const c = await this.citas.find({ where: { negocio: { id: negocio.id }, fecha, estado: 'confirmada' } });
    return c.some((x) => x.id !== ignorarId && aMin(hora) < aMin(x.hora) + this.duracionDe(x, negocio) && aMin(x.hora) < aMin(hora) + dur);
  }

  // Horas que se ofrecen a los clientes en una fecha (según horario, bloqueos y reglas del negocio)
  async horasOcupadas(negocioId: number, fecha: string, servicioId?: number) {
    const negocio = await this.negocios.findOneBy({ id: negocioId });
    if (!negocio || negocio.estado !== 'publicado') throw new NotFoundException('Negocio no encontrado');
    const servicio = servicioId ? await this.servicios.findOne({ where: { id: servicioId, negocio: { id: negocioId } } }) : null;
    const dur = servicio?.duracionMin ?? reglasDe(negocio).duracionBase;
    const confirmadas = await this.citas.find({ where: { negocio: { id: negocioId }, fecha, estado: 'confirmada' } });
    const r = horasDelDia(negocio, fecha, dur, confirmadas.map((x) => ({ hora: x.hora, dur: this.duracionDe(x, negocio) })));
    return { fecha, abierto: r.abierto, motivo: r.abierto ? undefined : r.motivo, duracionMin: dur, horas: r.horas, ocupadas: r.horas.filter((h) => !h.libre).map((h) => h.hora) };
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
    const oferta = await this.horasOcupadas(negocio.id, dto.fecha, dto.servicioId);
    if (!oferta.abierto) throw new BadRequestException(oferta.motivo ?? 'El negocio no atiende ese día');
    const h = oferta.horas.find((x) => x.hora === dto.hora);
    if (!h) throw new BadRequestException('Esa hora no está en el horario del negocio');
    if (!h.libre) throw new ConflictException('Ese horario ya no está disponible');
    const repetida = await this.citas.findOne({ where: { negocio: { id: negocio.id }, cliente: { id: clienteId }, fecha: dto.fecha, hora: dto.hora, estado: 'solicitada' } });
    if (repetida) throw new ConflictException('Ya tienes una solicitud para ese horario');
    const c = await this.citas.save(
      this.citas.create({ negocio, cliente: { id: clienteId } as Usuario, servicio, fecha: dto.fecha, hora: dto.hora, personas: dto.personas, notas: dto.notas ?? null, metodoPago: dto.metodoPago ?? null, estado: 'solicitada' }),
    );
    const completa = await this.citas.findOneByOrFail({ id: c.id });
    await this.avisos.avisarAlDueno(negocio.id, { tipo: 'cita', titulo: `Nueva solicitud de ${completa.cliente.nombre}`, detalle: `${servicio?.nombre ?? 'Cita'} · ${fCorta(dto.fecha)} · ${dto.hora} h`, enlace: '/portal/solicitudes' });
    return salida(completa);
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
    if (await this.hayChoque(c.negocio, c.fecha, c.hora, this.duracionDe(c, c.negocio), c.id)) throw new ConflictException('Ya tienes una cita confirmada que se encima con ese horario');
    c.estado = 'confirmada';
    await this.avisos.avisar(c.cliente.id, { tipo: 'cita', titulo: `${c.negocio.nombre} confirmó tu cita`, detalle: `${fCorta(c.fecha)} · ${c.hora} h`, enlace: '/reservaciones' });
    return salida(await this.citas.save(c));
  }

  async rechazar(userId: number, id: number) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.estado !== 'solicitada') throw new BadRequestException('Solo puedes rechazar una solicitud pendiente');
    c.estado = 'rechazada';
    await this.avisos.avisar(c.cliente.id, { tipo: 'cita', titulo: `${c.negocio.nombre} no pudo atender tu solicitud`, detalle: `${fCorta(c.fecha)} · ${c.hora} h`, enlace: '/reservaciones' });
    return salida(await this.citas.save(c));
  }

  async proponer(userId: number, id: number, dto: ProponerHorarioDto) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.estado !== 'solicitada') throw new BadRequestException('Solo puedes proponer otro horario en una solicitud pendiente');
    if (dto.fecha < hoy()) throw new BadRequestException('Elige una fecha de hoy en adelante');
    if (await this.hayChoque(c.negocio, dto.fecha, dto.hora, this.duracionDe(c, c.negocio), c.id)) throw new ConflictException('Ya tienes una cita confirmada que se encima con ese horario');
    c.estado = 'propuesta';
    c.propuestaFecha = dto.fecha;
    c.propuestaHora = dto.hora;
    await this.avisos.avisar(c.cliente.id, { tipo: 'cita', titulo: `${c.negocio.nombre} te propone otro horario`, detalle: `${fCorta(dto.fecha)} · ${dto.hora} h`, enlace: '/reservaciones' });
    return salida(await this.citas.save(c));
  }

  async aceptarPropuesta(clienteId: number, id: number) {
    const c = await this.citas.findOne({ where: { id, cliente: { id: clienteId } } });
    if (!c) throw new NotFoundException('Cita no encontrada');
    if (c.estado !== 'propuesta' || !c.propuestaFecha || !c.propuestaHora) throw new BadRequestException('Esta cita no tiene una propuesta pendiente');
    if (await this.hayChoque(c.negocio, c.propuestaFecha, c.propuestaHora, this.duracionDe(c, c.negocio), c.id)) throw new ConflictException('Ese horario ya no está disponible');
    c.fecha = c.propuestaFecha;
    c.hora = c.propuestaHora;
    c.propuestaFecha = c.propuestaHora = null;
    c.estado = 'confirmada';
    await this.avisos.avisarAlDueno(c.negocio.id, { tipo: 'cita', titulo: `${c.cliente.nombre} aceptó el nuevo horario`, detalle: `${fCorta(c.fecha)} · ${c.hora} h`, enlace: '/portal/solicitudes' });
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
    const detalle = `${fCorta(c.fecha)} · ${c.hora} h`;
    if (dueno) await this.avisos.avisar(c.cliente.id, { tipo: 'cita', titulo: `${c.negocio.nombre} canceló tu cita`, detalle, enlace: '/reservaciones' });
    else await this.avisos.avisarAlDueno(c.negocio.id, { tipo: 'cita', titulo: `${c.cliente.nombre} canceló su cita`, detalle, enlace: '/portal/solicitudes' });
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
    await this.avisos.avisarAlDueno(negocioId, { tipo: 'mensaje', titulo: `Mensaje nuevo de ${(await this.nombreUsuario(clienteId))}`, detalle: m.texto, enlace: `/portal/mensajes/${clienteId}` });
    return { id: m.id, de: m.de, texto: m.texto, creadoEn: m.creadoEn };
  }

  private async nombreUsuario(id: number) {
    return (await this.citas.manager.findOne(Usuario, { where: { id }, select: { id: true, nombre: true } }))?.nombre ?? 'un cliente';
  }

  // El negocio solo responde a clientes que ya le escribieron o le pidieron una cita
  async enviarNegocio(userId: number, clienteId: number, dto: MensajeDto) {
    const n = await this.negocioDe(userId);
    const previo = (await this.mensajes.existsBy({ negocio: { id: n.id }, cliente: { id: clienteId } })) || (await this.citas.existsBy({ negocio: { id: n.id }, cliente: { id: clienteId } }));
    if (!previo) throw new ForbiddenException('Solo puedes responder a clientes que te escribieron o pidieron una cita');
    const m = await this.mensajes.save(this.mensajes.create({ negocio: n, cliente: { id: clienteId } as Usuario, de: 'negocio', texto: dto.texto.trim() }));
    await this.avisos.avisar(clienteId, { tipo: 'mensaje', titulo: `${n.nombre} te respondió`, detalle: m.texto, enlace: `/negocio/${n.id}/mensajes` });
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
    await this.avisos.avisar(r.usuario.id, { tipo: 'resena', titulo: `${n.nombre} respondió tu reseña`, detalle: r.respuesta ?? undefined, enlace: `/negocio/${n.id}` });
    return { ...r, usuario: { id: r.usuario.id, nombre: r.usuario.nombre } };
  }

  // ---------- Disponibilidad (lado del negocio) ----------
  async disponibilidadMia(userId: number) {
    const n = await this.negocioDe(userId);
    const horarios = Object.fromEntries(DIAS.map((d) => [d, n.horariosJson?.[d] ?? HORARIO_INICIAL]));
    return { horarios, reglas: reglasDe(n), bloqueos: n.bloqueos ?? [] };
  }

  async guardarDisponibilidad(userId: number, dto: DisponibilidadDto) {
    const n = await this.negocioDe(userId);
    if (dto.horarios) {
      for (const d of DIAS) {
        const h = dto.horarios[d];
        if (!h) throw new BadRequestException(`Falta el horario de ${d}`);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h.apertura) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.cierre)) throw new BadRequestException(`Hora no válida en ${d}`);
        if (!h.cerrado && aMin(h.cierre) <= aMin(h.apertura)) throw new BadRequestException(`En ${d} el cierre debe ser después de la apertura`);
      }
      n.horariosJson = Object.fromEntries(DIAS.map((d) => [d, { apertura: dto.horarios![d].apertura, cierre: dto.horarios![d].cierre, cerrado: !!dto.horarios![d].cerrado }]));
    }
    if (dto.reglas) n.disponibilidad = { ...REGLAS_INICIALES, ...dto.reglas };
    if (dto.bloqueos) {
      for (const b of dto.bloqueos) if (b.hasta < b.desde) throw new BadRequestException('La fecha final del bloqueo no puede ser antes de la inicial');
      n.bloqueos = dto.bloqueos.map((b) => ({ desde: b.desde, hasta: b.hasta, motivo: (b.motivo ?? '').trim() }));
    }
    await this.negocios.save(n);
    return this.disponibilidadMia(userId);
  }
}

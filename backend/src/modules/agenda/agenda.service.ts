import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { NegocioVistaService } from '../../base/negocio-vista.service';
import { NotificacionesService } from '../../base/notificaciones.service';
import { borrarFoto, guardarFoto, urlPublica } from '../../common/almacenamiento';
import { Cita, DetalleNegocio, HorarioNegocio, Mensaje, Negocio, Resena, RespuestaResena, Servicio, Usuario } from '../../entidades';
import { CrearCitaDto, DisponibilidadDto, MensajeDto, ProponerHorarioDto, ServicioDto } from './dto';
import { DIAS, HORARIO_INICIAL, REGLAS_INICIALES, AgendaNegocio, ahoraLocal, aMin, horasDelDia, reglasDe } from './disponibilidad';

const hoy = () => ahoraLocal().fecha;
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : null);
const fCorta = (f: string) => new Date(`${f}T12:00:00Z`).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

// Servicio con los nombres de campo de la API
export const servicioApi = (s: Servicio) => ({
  id: s.id, nombre: s.name, descripcion: s.description, precio: s.price, duracionMin: s.durationMin, activo: s.isActive,
  categoria: s.category, modalidad: s.modality, costoTraslado: s.travelFee, indicaciones: s.instructions, fotoUrl: s.photoUrl, creadoEn: s.createdAt,
});

// Servicios, citas y mensajes entre clientes y negocios
@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Servicio) private servicios: Repository<Servicio>,
    @InjectRepository(Cita) private citas: Repository<Cita>,
    @InjectRepository(Mensaje) private mensajes: Repository<Mensaje>,
    @InjectRepository(Resena) private resenas: Repository<Resena>,
    @InjectRepository(RespuestaResena) private respuestas: Repository<RespuestaResena>,
    @InjectRepository(Usuario) private usuarios: Repository<Usuario>,
    @InjectRepository(DetalleNegocio) private detalles: Repository<DetalleNegocio>,
    private vistas: NegocioVistaService,
    private avisos: NotificacionesService,
    private ds: DataSource,
  ) {}

  private negocioDe(userId: string) {
    return this.vistas.delDueno(userId);
  }

  // Nunca se devuelve el usuario completo (traería la contraseña)
  private async salidas(lista: Cita[]) {
    const negocios = await this.vistas.vistas([...new Map(lista.map((c) => [c.negocio.id, c.negocio])).values()]);
    return lista.map((c) => {
      const n = negocios.find((x) => x.id === c.businessId)!;
      return {
        id: c.id, estado: c.status, fecha: c.date, hora: hhmm(c.startTime)!, personas: c.partySize, notas: c.notes, metodoPago: c.paymentMethod,
        propuestaFecha: c.proposedDate, propuestaHora: hhmm(c.proposedTime), creadoEn: c.createdAt,
        servicio: c.servicio ? { id: c.servicio.id, nombre: c.servicio.name, precio: c.servicio.price, duracionMin: c.servicio.durationMin } : null,
        negocio: { id: n.id, nombre: n.nombre, imagenUrl: n.imagenUrl, direccion: n.direccion, telefono: n.telefono },
        cliente: { id: c.cliente.id, nombre: c.cliente.nCompleto, telefono: c.cliente.telefono },
      };
    });
  }

  private async salida(c: Cita) {
    return (await this.salidas([c]))[0];
  }

  private cargarCita(where: Record<string, unknown>) {
    return this.citas.findOne({ where, relations: { negocio: true, cliente: true, servicio: true } });
  }

  // ---------- Servicios ----------
  async serviciosPublicos(negocioId: string) {
    const l = await this.servicios.find({ where: { businessId: negocioId, isActive: true }, order: { createdAt: 'ASC' } });
    return l.map(servicioApi);
  }

  async serviciosMios(userId: string) {
    const n = await this.negocioDe(userId);
    return (await this.servicios.find({ where: { businessId: n.id }, order: { createdAt: 'ASC' } })).map(servicioApi);
  }

  private async datosServicio(n: Negocio, dto: ServicioDto) {
    const modalidad = dto.modalidad ?? 'local';
    if (modalidad !== 'local' && !(await this.vistas.detalle(n.id)).homeService) {
      throw new BadRequestException('Para ofrecer servicio a domicilio activa “Atiendo a domicilio” en Ubicación y cobertura');
    }
    return {
      name: dto.nombre.trim(),
      description: dto.descripcion?.trim() || null,
      price: dto.precio ?? null,
      durationMin: dto.duracionMin,
      category: dto.categoria?.trim() || null,
      modality: modalidad,
      travelFee: modalidad === 'local' ? null : dto.costoTraslado ?? null,
      instructions: dto.indicaciones?.trim() || null,
    };
  }

  async crearServicio(userId: string, dto: ServicioDto) {
    const n = await this.negocioDe(userId);
    const s = await this.servicios.save(this.servicios.create({ ...(await this.datosServicio(n, dto)), isActive: dto.activo ?? true, businessId: n.id }));
    return servicioApi(s);
  }

  private async servicioMio(userId: string, id: string) {
    const n = await this.negocioDe(userId);
    const s = await this.servicios.findOneBy({ id, businessId: n.id });
    if (!s) throw new NotFoundException('Servicio no encontrado');
    return { s, n };
  }

  async actualizarServicio(userId: string, id: string, dto: ServicioDto) {
    const { s, n } = await this.servicioMio(userId, id);
    Object.assign(s, await this.datosServicio(n, dto), { isActive: dto.activo ?? s.isActive });
    return servicioApi(await this.servicios.save(s));
  }

  async fotoServicio(userId: string, id: string, archivo: Express.Multer.File | null) {
    const { s } = await this.servicioMio(userId, id);
    const anterior = s.photoUrl;
    s.photoUrl = archivo ? await guardarFoto(archivo, 'divika/servicios') : null;
    const guardado = await this.servicios.save(s);
    await borrarFoto(anterior);
    return servicioApi(guardado);
  }

  async borrarServicio(userId: string, id: string) {
    const { s } = await this.servicioMio(userId, id);
    await this.servicios.remove(s);
    await borrarFoto(s.photoUrl);
    return { ok: true };
  }

  // ---------- Citas ----------
  private duracionDe(c: Cita, a: AgendaNegocio) {
    return c.servicio?.durationMin ?? reglasDe(a).duracionBase;
  }

  // ¿Se encima con una cita ya confirmada?
  private async hayChoque(businessId: string, fecha: string, hora: string, dur: number, ignorarId?: string) {
    const a = await this.vistas.agenda(businessId);
    const c = await this.citas.find({ where: { businessId, date: fecha, status: 'confirmada' }, relations: { servicio: true } });
    return c.some((x) => x.id !== ignorarId && aMin(hora) < aMin(x.startTime) + this.duracionDe(x, a) && aMin(x.startTime) < aMin(hora) + dur);
  }

  // Horas que se ofrecen a los clientes en una fecha (según horario, bloqueos y reglas del negocio)
  async horasOcupadas(negocioId: string, fecha: string, servicioId?: string) {
    if (!(await this.vistas.esVisible(negocioId))) throw new NotFoundException('Negocio no encontrado');
    const a = await this.vistas.agenda(negocioId);
    const servicio = servicioId ? await this.servicios.findOneBy({ id: servicioId, businessId: negocioId }) : null;
    const dur = servicio?.durationMin ?? reglasDe(a).duracionBase;
    const confirmadas = await this.citas.find({ where: { businessId: negocioId, date: fecha, status: 'confirmada' }, relations: { servicio: true } });
    const r = horasDelDia(a, fecha, dur, confirmadas.map((x) => ({ hora: hhmm(x.startTime)!, dur: this.duracionDe(x, a) })));
    return { fecha, abierto: r.abierto, motivo: r.abierto ? undefined : r.motivo, duracionMin: dur, horas: r.horas, ocupadas: r.horas.filter((h) => !h.libre).map((h) => h.hora) };
  }

  async crearCita(clienteId: string, dto: CrearCitaDto) {
    if (!(await this.vistas.esVisible(dto.negocioId))) throw new NotFoundException('Negocio no encontrado');
    if (dto.fecha < hoy()) throw new BadRequestException('Elige una fecha de hoy en adelante');
    let servicio: Servicio | null = null;
    if (dto.servicioId) {
      servicio = await this.servicios.findOneBy({ id: dto.servicioId, businessId: dto.negocioId, isActive: true });
      if (!servicio) throw new BadRequestException('Ese servicio no existe en este negocio');
    }
    const metodos = (await this.vistas.detalle(dto.negocioId)).paymentMethods;
    if (dto.metodoPago && metodos?.length && !metodos.includes(dto.metodoPago)) throw new BadRequestException('El negocio no acepta esa forma de pago');
    const oferta = await this.horasOcupadas(dto.negocioId, dto.fecha, dto.servicioId);
    if (!oferta.abierto) throw new BadRequestException(oferta.motivo ?? 'El negocio no atiende ese día');
    const h = oferta.horas.find((x) => x.hora === dto.hora);
    if (!h) throw new BadRequestException('Esa hora no está en el horario del negocio');
    if (!h.libre) throw new ConflictException('Ese horario ya no está disponible');
    const repetida = await this.citas.existsBy({ businessId: dto.negocioId, clientId: clienteId, date: dto.fecha, startTime: `${dto.hora}:00`, status: 'solicitada' });
    if (repetida) throw new ConflictException('Ya tienes una solicitud para ese horario');
    const nueva = await this.citas.save(
      this.citas.create({
        businessId: dto.negocioId, clientId: clienteId, serviceId: servicio?.id ?? null, date: dto.fecha, startTime: dto.hora,
        partySize: dto.personas, notes: dto.notas?.trim() || null, paymentMethod: dto.metodoPago ?? null, status: 'solicitada',
      }),
    );
    const c = (await this.cargarCita({ id: nueva.id }))!;
    await this.avisos.avisarAlDueno(c.businessId, { tipo: 'cita', titulo: `Nueva solicitud de ${c.cliente.nCompleto}`, detalle: `${servicio?.name ?? 'Cita'} · ${fCorta(dto.fecha)} · ${dto.hora} h`, enlace: '/portal/solicitudes' });
    return this.salida(c);
  }

  async citasDelCliente(clienteId: string) {
    const l = await this.citas.find({ where: { clientId: clienteId }, relations: { negocio: true, cliente: true, servicio: true }, order: { date: 'DESC', startTime: 'DESC' } });
    return this.salidas(l);
  }

  async citasDelNegocio(userId: string) {
    const n = await this.negocioDe(userId);
    const l = await this.citas.find({ where: { businessId: n.id }, relations: { negocio: true, cliente: true, servicio: true }, order: { date: 'ASC', startTime: 'ASC' } });
    return this.salidas(l);
  }

  private async citaDelNegocio(userId: string, id: string) {
    const n = await this.negocioDe(userId);
    const c = await this.cargarCita({ id, businessId: n.id });
    if (!c) throw new NotFoundException('Cita no encontrada');
    return c;
  }

  async confirmar(userId: string, id: string) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.status !== 'solicitada') throw new BadRequestException('Solo puedes confirmar una solicitud pendiente');
    const dur = this.duracionDe(c, await this.vistas.agenda(c.businessId));
    if (await this.hayChoque(c.businessId, c.date, c.startTime, dur, c.id)) throw new ConflictException('Ya tienes una cita confirmada que se encima con ese horario');
    c.status = 'confirmada';
    await this.citas.save(c);
    await this.avisos.avisar(c.clientId, { tipo: 'cita', titulo: `${c.negocio.tradeName} confirmó tu cita`, detalle: `${fCorta(c.date)} · ${hhmm(c.startTime)} h`, enlace: '/reservaciones' });
    return this.salida(c);
  }

  async rechazar(userId: string, id: string) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.status !== 'solicitada') throw new BadRequestException('Solo puedes rechazar una solicitud pendiente');
    c.status = 'rechazada';
    await this.citas.save(c);
    await this.avisos.avisar(c.clientId, { tipo: 'cita', titulo: `${c.negocio.tradeName} no pudo atender tu solicitud`, detalle: `${fCorta(c.date)} · ${hhmm(c.startTime)} h`, enlace: '/reservaciones' });
    return this.salida(c);
  }

  async proponer(userId: string, id: string, dto: ProponerHorarioDto) {
    const c = await this.citaDelNegocio(userId, id);
    if (c.status !== 'solicitada') throw new BadRequestException('Solo puedes proponer otro horario en una solicitud pendiente');
    if (dto.fecha < hoy()) throw new BadRequestException('Elige una fecha de hoy en adelante');
    const dur = this.duracionDe(c, await this.vistas.agenda(c.businessId));
    if (await this.hayChoque(c.businessId, dto.fecha, dto.hora, dur, c.id)) throw new ConflictException('Ya tienes una cita confirmada que se encima con ese horario');
    c.status = 'propuesta';
    c.proposedDate = dto.fecha;
    c.proposedTime = dto.hora;
    await this.citas.save(c);
    await this.avisos.avisar(c.clientId, { tipo: 'cita', titulo: `${c.negocio.tradeName} te propone otro horario`, detalle: `${fCorta(dto.fecha)} · ${dto.hora} h`, enlace: '/reservaciones' });
    return this.salida(c);
  }

  async aceptarPropuesta(clienteId: string, id: string) {
    const c = await this.cargarCita({ id, clientId: clienteId });
    if (!c) throw new NotFoundException('Cita no encontrada');
    if (c.status !== 'propuesta' || !c.proposedDate || !c.proposedTime) throw new BadRequestException('Esta cita no tiene una propuesta pendiente');
    const dur = this.duracionDe(c, await this.vistas.agenda(c.businessId));
    if (await this.hayChoque(c.businessId, c.proposedDate, c.proposedTime, dur, c.id)) throw new ConflictException('Ese horario ya no está disponible');
    c.date = c.proposedDate;
    c.startTime = c.proposedTime;
    c.proposedDate = c.proposedTime = null;
    c.status = 'confirmada';
    await this.citas.save(c);
    await this.avisos.avisarAlDueno(c.businessId, { tipo: 'cita', titulo: `${c.cliente.nCompleto} aceptó el nuevo horario`, detalle: `${fCorta(c.date)} · ${hhmm(c.startTime)} h`, enlace: '/portal/solicitudes' });
    return this.salida(c);
  }

  // Cancela el cliente dueño de la cita o el dueño del negocio
  async cancelar(userId: string, id: string) {
    const c = await this.cargarCita({ id });
    if (!c) throw new NotFoundException('Cita no encontrada');
    const esDueno = c.negocio.ownerId === userId;
    if (c.clientId !== userId && !esDueno) throw new ForbiddenException('No puedes cancelar esta cita');
    if (!['solicitada', 'confirmada', 'propuesta'].includes(c.status)) throw new BadRequestException('Esta cita ya no se puede cancelar');
    c.status = 'cancelada';
    await this.citas.save(c);
    const detalle = `${fCorta(c.date)} · ${hhmm(c.startTime)} h`;
    if (esDueno) await this.avisos.avisar(c.clientId, { tipo: 'cita', titulo: `${c.negocio.tradeName} canceló tu cita`, detalle, enlace: '/reservaciones' });
    else await this.avisos.avisarAlDueno(c.businessId, { tipo: 'cita', titulo: `${c.cliente.nCompleto} canceló su cita`, detalle, enlace: '/portal/solicitudes' });
    return this.salida(c);
  }

  // ---------- Mensajes ----------
  private resumen(filas: Mensaje[], lado: 'cliente' | 'negocio') {
    type Conv = { con: { id: string; nombre: string; imagenUrl?: string | null }; ultimo: { texto: string; de: string; creadoEn: Date }; sinLeer: number };
    const mapa = new Map<string, Conv>();
    for (const m of filas) {
      const otro = lado === 'negocio' ? { id: m.cliente.id, nombre: m.cliente.nCompleto } : { id: m.negocio.id, nombre: m.negocio.tradeName, imagenUrl: urlPublica(m.negocio.coverUrl) };
      if (!mapa.has(otro.id)) mapa.set(otro.id, { con: otro, ultimo: { texto: m.body, de: m.sender, creadoEn: m.createdAt }, sinLeer: 0 });
      if (!m.readAt && m.sender !== lado) mapa.get(otro.id)!.sinLeer += 1;
    }
    return [...mapa.values()];
  }

  async conversacionesCliente(clienteId: string) {
    const f = await this.mensajes.find({ where: { clientId: clienteId }, relations: { negocio: true, cliente: true }, order: { createdAt: 'DESC' } });
    return this.resumen(f, 'cliente');
  }

  async conversacionesNegocio(userId: string) {
    const n = await this.negocioDe(userId);
    const f = await this.mensajes.find({ where: { businessId: n.id }, relations: { negocio: true, cliente: true }, order: { createdAt: 'DESC' } });
    return this.resumen(f, 'negocio');
  }

  private async hilo(businessId: string, clientId: string, lector: 'cliente' | 'negocio') {
    const l = await this.mensajes.find({ where: { businessId, clientId }, order: { createdAt: 'ASC' } });
    await this.mensajes.update({ businessId, clientId, sender: Not(lector), readAt: IsNull() }, { readAt: new Date() });
    return l.map((m) => ({ id: m.id, de: m.sender, texto: m.body, creadoEn: m.createdAt }));
  }

  hiloCliente(clienteId: string, negocioId: string) {
    return this.hilo(negocioId, clienteId, 'cliente');
  }

  async hiloNegocio(userId: string, clienteId: string) {
    const n = await this.negocioDe(userId);
    return this.hilo(n.id, clienteId, 'negocio');
  }

  async enviarCliente(clienteId: string, negocioId: string, dto: MensajeDto) {
    if (!(await this.vistas.esVisible(negocioId))) throw new NotFoundException('Negocio no encontrado');
    const m = await this.mensajes.save(this.mensajes.create({ businessId: negocioId, clientId: clienteId, sender: 'cliente', body: dto.texto.trim() }));
    const autor = await this.usuarios.findOne({ where: { id: clienteId }, select: { id: true, nCompleto: true } });
    await this.avisos.avisarAlDueno(negocioId, { tipo: 'mensaje', titulo: `Mensaje nuevo de ${autor?.nCompleto ?? 'un cliente'}`, detalle: m.body, enlace: `/portal/mensajes/${clienteId}` });
    return { id: m.id, de: m.sender, texto: m.body, creadoEn: m.createdAt };
  }

  // El negocio solo responde a clientes que ya le escribieron o le pidieron una cita
  async enviarNegocio(userId: string, clienteId: string, dto: MensajeDto) {
    const n = await this.negocioDe(userId);
    const previo = (await this.mensajes.existsBy({ businessId: n.id, clientId: clienteId })) || (await this.citas.existsBy({ businessId: n.id, clientId: clienteId }));
    if (!previo) throw new ForbiddenException('Solo puedes responder a clientes que te escribieron o pidieron una cita');
    const m = await this.mensajes.save(this.mensajes.create({ businessId: n.id, clientId: clienteId, sender: 'negocio', body: dto.texto.trim() }));
    await this.avisos.avisar(clienteId, { tipo: 'mensaje', titulo: `${n.tradeName} te respondió`, detalle: m.body, enlace: `/negocio/${n.id}/mensajes` });
    return { id: m.id, de: m.sender, texto: m.body, creadoEn: m.createdAt };
  }

  // ---------- Reseñas (lado del negocio) ----------
  async resenasMias(userId: string) {
    const n = await this.negocioDe(userId);
    const l = await this.resenas.find({ where: { businessId: n.id, status: 'publicado' }, relations: { usuario: true }, order: { createdAt: 'DESC' } });
    const resp = l.length ? await this.respuestas.findBy({ reviewId: In(l.map((r) => r.id)) }) : [];
    return l.map((r) => resenaApi(r, resp.find((x) => x.reviewId === r.id)));
  }

  async responderResena(userId: string, id: string, texto: string) {
    const n = await this.negocioDe(userId);
    const r = await this.resenas.findOne({ where: { id, businessId: n.id }, relations: { usuario: true } });
    if (!r) throw new NotFoundException('Reseña no encontrada');
    const respuesta = await this.respuestas.save(this.respuestas.create({ reviewId: r.id, body: texto.trim(), createdAt: new Date() }));
    await this.avisos.avisar(r.userId, { tipo: 'resena', titulo: `${n.tradeName} respondió tu reseña`, detalle: respuesta.body, enlace: `/negocio/${n.id}` });
    return resenaApi(r, respuesta);
  }

  // ---------- Disponibilidad (lado del negocio): business_hours + business_details ----------
  async disponibilidadMia(userId: string) {
    const n = await this.negocioDe(userId);
    const a = await this.vistas.agenda(n.id);
    const horarios = Object.fromEntries(DIAS.map((d) => [d, a.horariosJson?.[d] ?? HORARIO_INICIAL]));
    return { horarios, reglas: reglasDe(a), bloqueos: a.bloqueos ?? [] };
  }

  async guardarDisponibilidad(userId: string, dto: DisponibilidadDto) {
    const n = await this.negocioDe(userId);
    if (dto.horarios) {
      for (const d of DIAS) {
        const h = dto.horarios[d];
        if (!h) throw new BadRequestException(`Falta el horario de ${d}`);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h.apertura) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.cierre)) throw new BadRequestException(`Hora no válida en ${d}`);
        if (!h.cerrado && aMin(h.cierre) <= aMin(h.apertura)) throw new BadRequestException(`En ${d} el cierre debe ser después de la apertura`);
      }
      await this.ds.transaction(async (m) => {
        await m.delete(HorarioNegocio, { businessId: n.id });
        await m.insert(
          HorarioNegocio,
          DIAS.map((d, weekday) => ({ businessId: n.id, weekday, openTime: dto.horarios![d].apertura, closeTime: dto.horarios![d].cierre, isClosed: !!dto.horarios![d].cerrado })),
        );
      });
    }
    if (dto.reglas || dto.bloqueos) {
      const det = await this.vistas.detalle(n.id);
      if (dto.reglas) det.bookingRules = { ...REGLAS_INICIALES, ...dto.reglas };
      if (dto.bloqueos) {
        for (const b of dto.bloqueos) if (b.hasta < b.desde) throw new BadRequestException('La fecha final del bloqueo no puede ser antes de la inicial');
        det.blockedDates = dto.bloqueos.map((b) => ({ desde: b.desde, hasta: b.hasta, motivo: (b.motivo ?? '').trim() }));
      }
      await this.detalles.save(det);
    }
    return this.disponibilidadMia(userId);
  }
}

// Reseña con los nombres de campo de la API (solo id y nombre del autor)
export const resenaApi = (r: Resena, respuesta?: RespuestaResena | null) => ({
  id: r.id, calificacion: r.rating, comentario: r.comment, creadoEn: r.createdAt,
  usuario: { id: r.usuario.id, nombre: r.usuario.nCompleto },
  respuesta: respuesta?.body ?? null, respuestaEn: respuesta?.createdAt ?? null,
});

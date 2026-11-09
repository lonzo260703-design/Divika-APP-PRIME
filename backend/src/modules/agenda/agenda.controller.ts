import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CARPETA_FOTOS } from '../proveedores/negocio-proveedor.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { AgendaService } from './agenda.service';
import { CrearCitaDto, DisponibilidadDto, MensajeDto, ProponerHorarioDto, RespuestaResenaDto, ServicioDto } from './dto';

type Req_ = { user: { sub: number } };

const subidaServicio = FileInterceptor('foto', {
  storage: diskStorage({ destination: CARPETA_FOTOS, filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`) }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => (/^image\/(jpeg|png)$/.test(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Solo se aceptan fotos JPG o PNG'), false)),
});

// Lo que ve cualquier visitante
@Controller('negocios')
export class AgendaPublicaController {
  constructor(private s: AgendaService) {}

  @Get(':id/servicios')
  servicios(@Param('id', ParseIntPipe) id: number) {
    return this.s.serviciosPublicos(id);
  }

  @Get(':id/disponibilidad')
  disponibilidad(@Param('id', ParseIntPipe) id: number, @Query('fecha') fecha: string, @Query('servicioId') servicioId?: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? '')) throw new BadRequestException('Manda la fecha como AAAA-MM-DD');
    return this.s.horasOcupadas(id, fecha, servicioId ? Number(servicioId) : undefined);
  }
}

// Lado del cliente
@UseGuards(JwtAuthGuard)
@Controller()
export class AgendaClienteController {
  constructor(private s: AgendaService) {}

  @Post('citas')
  crear(@Req() r: Req_, @Body() dto: CrearCitaDto) {
    return this.s.crearCita(r.user.sub, dto);
  }
  @Get('citas/mias')
  mias(@Req() r: Req_) {
    return this.s.citasDelCliente(r.user.sub);
  }
  @Post('citas/:id/aceptar-propuesta')
  aceptar(@Req() r: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.s.aceptarPropuesta(r.user.sub, id);
  }
  // Cancela el cliente o el dueño del negocio
  @Post('citas/:id/cancelar')
  cancelar(@Req() r: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.s.cancelar(r.user.sub, id);
  }

  @Get('mensajes')
  conversaciones(@Req() r: Req_) {
    return this.s.conversacionesCliente(r.user.sub);
  }
  @Get('mensajes/negocio/:negocioId')
  hilo(@Req() r: Req_, @Param('negocioId', ParseIntPipe) id: number) {
    return this.s.hiloCliente(r.user.sub, id);
  }
  @Post('mensajes/negocio/:negocioId')
  enviar(@Req() r: Req_, @Param('negocioId', ParseIntPipe) id: number, @Body() dto: MensajeDto) {
    return this.s.enviarCliente(r.user.sub, id, dto);
  }
}

// Lado del negocio (el dueño con sesión)
@UseGuards(JwtAuthGuard)
@Controller('proveedor')
export class AgendaProveedorController {
  constructor(private s: AgendaService) {}

  @Get('servicios')
  servicios(@Req() r: Req_) {
    return this.s.serviciosMios(r.user.sub);
  }
  @Post('servicios')
  crearServicio(@Req() r: Req_, @Body() dto: ServicioDto) {
    return this.s.crearServicio(r.user.sub, dto);
  }
  @Put('servicios/:id')
  editarServicio(@Req() r: Req_, @Param('id', ParseIntPipe) id: number, @Body() dto: ServicioDto) {
    return this.s.actualizarServicio(r.user.sub, id, dto);
  }
  // multipart/form-data con el campo "foto" (JPG o PNG, máx. 10 MB)
  @Post('servicios/:id/foto')
  @UseInterceptors(subidaServicio)
  fotoServicio(@Req() r: Req_, @Param('id', ParseIntPipe) id: number, @UploadedFile() foto?: Express.Multer.File) {
    if (!foto) throw new BadRequestException('Selecciona una foto (JPG o PNG, máx. 10 MB)');
    const base = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    return this.s.fotoServicio(r.user.sub, id, `${base}/uploads/${foto.filename}`);
  }
  @Delete('servicios/:id/foto')
  quitarFotoServicio(@Req() r: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.s.fotoServicio(r.user.sub, id, null);
  }
  @Delete('servicios/:id')
  borrarServicio(@Req() r: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.s.borrarServicio(r.user.sub, id);
  }

  @Get('citas')
  citas(@Req() r: Req_) {
    return this.s.citasDelNegocio(r.user.sub);
  }
  @Post('citas/:id/confirmar')
  confirmar(@Req() r: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.s.confirmar(r.user.sub, id);
  }
  @Post('citas/:id/rechazar')
  rechazar(@Req() r: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.s.rechazar(r.user.sub, id);
  }
  @Post('citas/:id/proponer')
  proponer(@Req() r: Req_, @Param('id', ParseIntPipe) id: number, @Body() dto: ProponerHorarioDto) {
    return this.s.proponer(r.user.sub, id, dto);
  }

  @Get('mensajes')
  conversaciones(@Req() r: Req_) {
    return this.s.conversacionesNegocio(r.user.sub);
  }
  @Get('mensajes/:clienteId')
  hilo(@Req() r: Req_, @Param('clienteId', ParseIntPipe) id: number) {
    return this.s.hiloNegocio(r.user.sub, id);
  }
  @Post('mensajes/:clienteId')
  enviar(@Req() r: Req_, @Param('clienteId', ParseIntPipe) id: number, @Body() dto: MensajeDto) {
    return this.s.enviarNegocio(r.user.sub, id, dto);
  }

  @Get('disponibilidad')
  miDisponibilidad(@Req() r: Req_) {
    return this.s.disponibilidadMia(r.user.sub);
  }
  @Put('disponibilidad')
  guardarDisponibilidad(@Req() r: Req_, @Body() dto: DisponibilidadDto) {
    return this.s.guardarDisponibilidad(r.user.sub, dto);
  }

  @Get('resenas')
  resenas(@Req() r: Req_) {
    return this.s.resenasMias(r.user.sub);
  }
  @Post('resenas/:id/respuesta')
  responder(@Req() r: Req_, @Param('id', ParseIntPipe) id: number, @Body() dto: RespuestaResenaDto) {
    return this.s.responderResena(r.user.sub, id, dto.texto);
  }
}

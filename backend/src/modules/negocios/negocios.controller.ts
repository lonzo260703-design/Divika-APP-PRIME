import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { NegociosService } from './negocios.service';
import { CrearNegocioDto, ActualizarNegocioDto } from './dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('negocios')
export class NegociosController {
  constructor(private service: NegociosService) {}

  // Filtros: buscar (nombre), categoria, subcategoria. orden=distancia necesita lat y lng (si no, va por calificación)
  @Get()
  listar(
    @Query('buscar') buscar?: string,
    @Query('categoria') categoria?: string,
    @Query('subcategoria') subcategoria?: string,
    @Query('orden') orden?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.service.listar({
      buscar,
      categoria,
      subcategoria,
      orden: orden === 'distancia' ? 'distancia' : 'calificacion',
      lat: lat !== undefined ? parseFloat(lat) : undefined,
      lng: lng !== undefined ? parseFloat(lng) : undefined,
    });
  }

  @Get('top')
  top() {
    return this.service.top(10);
  }

  @Get('cercanos')
  listarCercanos(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radio') radio?: string,
  ) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radioNum = radio ? parseFloat(radio) : 10;
    return this.service.listarCercanos(latNum, lngNum, radioNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('propietario/mis-negocios')
  listarMisNegocios(@Req() req: { user: { sub: number } }) {
    return this.service.listarPorPropietario(req.user.sub);
  }

  @Get(':id')
  uno(@Param('id', ParseIntPipe) id: number) {
    return this.service.uno(id);
  }

  @Post(':id/clic-whatsapp')
  clicWhatsapp(@Param('id', ParseIntPipe) id: number) {
    return this.service.registrarClicWhatsapp(id);
  }

  @Post(':id/clic-llamada')
  clicLlamada(@Param('id', ParseIntPipe) id: number) {
    return this.service.registrarClicLlamada(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  crear(@Req() req: { user: { sub: number } }, @Body() dto: CrearNegocioDto) {
    return this.service.crear(dto, { id: req.user.sub } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number } },
    @Body() dto: ActualizarNegocioDto,
  ) {
    return this.service.actualizar(id, dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/fotos')
  actualizarFotos(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { sub: number } },
    @Body() body: { imagenUrl?: string; galeria?: string[] },
  ) {
    return this.service.actualizarFotos(id, body.imagenUrl, body.galeria, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { sub: number } }) {
    return this.service.eliminar(id, req.user.sub);
  }
}

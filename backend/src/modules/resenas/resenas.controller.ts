import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { CrearResenaDto } from './dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('resenas')
export class ResenasController {
  constructor(private service: ResenasService) {}

  // Listar reseñas de un negocio (público)
  @Get('negocio/:negocioId')
  listarPorNegocio(@Param('negocioId', ParseIntPipe) negocioId: number) {
    return this.service.listarPorNegocio(negocioId);
  }

  // Crear una reseña (requiere autenticación de un usuario válido)
  @UseGuards(JwtAuthGuard)
  @Post()
  crear(@Req() req: { user: { sub: number } }, @Body() dto: CrearResenaDto) {
    return this.service.crear(req.user.sub, dto);
  }
}

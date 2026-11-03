import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favoritos')
export class FavoritosController {
  constructor(private service: FavoritosService) {}

  @Get()
  listar(@Req() req: { user: { sub: number } }) {
    return this.service.listar(req.user.sub);
  }

  @Post(':negocioId')
  agregar(@Req() req: { user: { sub: number } }, @Param('negocioId', ParseIntPipe) negocioId: number) {
    return this.service.agregar(req.user.sub, negocioId);
  }

  @Delete(':negocioId')
  quitar(@Req() req: { user: { sub: number } }, @Param('negocioId', ParseIntPipe) negocioId: number) {
    return this.service.quitar(req.user.sub, negocioId);
  }
}

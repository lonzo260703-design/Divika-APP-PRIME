import { Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { NotificacionesService } from './notificaciones.service';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private s: NotificacionesService) {}

  @Get()
  listar(@Req() r: { user: { sub: number } }) {
    return this.s.listar(r.user.sub);
  }
  @Post('leer-todas')
  leerTodas(@Req() r: { user: { sub: number } }) {
    return this.s.leerTodas(r.user.sub);
  }
  @Post(':id/leer')
  leer(@Req() r: { user: { sub: number } }, @Param('id', ParseIntPipe) id: number) {
    return this.s.leer(r.user.sub, id);
  }
}

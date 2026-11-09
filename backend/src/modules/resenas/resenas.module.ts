import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resena } from './resena.entity';
import { ResenasService } from './resenas.service';
import { ResenasController } from './resenas.controller';
import { AuthModule } from '../auth/auth.module';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Resena, Negocio, Usuario]), AuthModule, NotificacionesModule],
  controllers: [ResenasController],
  providers: [ResenasService],
})
export class ResenasModule {}

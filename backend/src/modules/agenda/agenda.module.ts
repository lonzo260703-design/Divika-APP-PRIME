import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Negocio } from '../negocios/negocio.entity';
import { Resena } from '../resenas/resena.entity';
import { AgendaClienteController, AgendaProveedorController, AgendaPublicaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { Cita } from './cita.entity';
import { Mensaje } from './mensaje.entity';
import { Servicio } from './servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, Cita, Mensaje, Negocio, Resena]), AuthModule],
  controllers: [AgendaPublicaController, AgendaClienteController, AgendaProveedorController],
  providers: [AgendaService],
})
export class AgendaModule {}

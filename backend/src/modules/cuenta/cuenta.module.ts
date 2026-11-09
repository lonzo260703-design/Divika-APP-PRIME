import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Favorito } from '../favoritos/favorito.entity';
import { Resena } from '../resenas/resena.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CuentaController, SoporteController } from './cuenta.controller';
import { CuentaService } from './cuenta.service';
import { ReporteProblema } from './reporte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Resena, Favorito, ReporteProblema]), AuthModule],
  controllers: [CuentaController, SoporteController],
  providers: [CuentaService],
})
export class CuentaModule {}

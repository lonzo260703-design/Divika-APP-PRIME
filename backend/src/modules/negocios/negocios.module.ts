import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Negocio } from './negocio.entity';
import { CategoriasController } from './categorias.controller';
import { NegociosController } from './negocios.controller';
import { NegociosService } from './negocios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Negocio]), AuthModule],
  controllers: [NegociosController, CategoriasController],
  providers: [NegociosService],
})
export class NegociosModule {}

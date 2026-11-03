import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resena } from './resena.entity';
import { ResenasService } from './resenas.service';
import { ResenasController } from './resenas.controller';
import { Negocio } from '../negocios/negocio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resena, Negocio])],
  controllers: [ResenasController],
  providers: [ResenasService],
})
export class ResenasModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interesado } from './interesado.entity';
import { ProveedoresController } from './proveedores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interesado])],
  controllers: [ProveedoresController],
})
export class ProveedoresModule {}

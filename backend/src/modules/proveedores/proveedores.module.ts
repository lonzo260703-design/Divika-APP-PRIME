import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Negocio } from '../negocios/negocio.entity';
import { Interesado } from './interesado.entity';
import { NegocioProveedorController } from './negocio-proveedor.controller';
import { NegocioProveedorService } from './negocio-proveedor.service';
import { ProveedoresController } from './proveedores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interesado, Negocio]), AuthModule],
  controllers: [ProveedoresController, NegocioProveedorController],
  providers: [NegocioProveedorService],
})
export class ProveedoresModule {}

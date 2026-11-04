import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearInteresadoDto } from './dto';
import { Interesado } from './interesado.entity';

@Controller('proveedores')
export class ProveedoresController {
  constructor(@InjectRepository(Interesado) private readonly repo: Repository<Interesado>) {}

  // Formulario "Únete gratis" de la landing de proveedores (sin sesión)
  @Post('interesados')
  async crear(@Body() dto: CrearInteresadoDto) {
    await this.repo.save(this.repo.create(dto));
    return { ok: true };
  }
}

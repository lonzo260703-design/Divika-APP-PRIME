import { Controller, Get } from '@nestjs/common';
import { CATALOGO } from './categorias';

@Controller('categorias')
export class CategoriasController {
  // Lista pública de categorías con sus subcategorías (la usan el home, los listados y el registro de negocio)
  @Get()
  listar() {
    return CATALOGO;
  }
}

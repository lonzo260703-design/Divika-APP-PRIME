import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ActualizarPerfilDto, OrdenFotosDto } from './negocio-proveedor.dto';
import { CARPETA_FOTOS, NegocioProveedorService } from './negocio-proveedor.service';

type Req_ = { user: { sub: number } };

const subida = FileInterceptor('foto', {
  storage: diskStorage({
    destination: CARPETA_FOTOS,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpeg|png)$/.test(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Solo se aceptan fotos JPG o PNG'), false),
});

@UseGuards(JwtAuthGuard)
@Controller('proveedor/negocio')
export class NegocioProveedorController {
  constructor(private service: NegocioProveedorService) {}

  @Get()
  obtener(@Req() req: Req_) {
    return this.service.obtener(req.user.sub);
  }

  @Put()
  actualizar(@Req() req: Req_, @Body() dto: ActualizarPerfilDto) {
    return this.service.actualizar(req.user.sub, dto);
  }

  @Post('publicar')
  publicar(@Req() req: Req_) {
    return this.service.publicar(req.user.sub);
  }

  @Post('pausar')
  pausar(@Req() req: Req_) {
    return this.service.pausar(req.user.sub);
  }

  // multipart/form-data con el campo "foto" (JPG o PNG, máx. 10 MB). Devuelve el negocio actualizado
  @Post('fotos')
  @UseInterceptors(subida)
  subirFoto(@Req() req: Req_, @UploadedFile() foto?: Express.Multer.File) {
    if (!foto) throw new BadRequestException('Selecciona una foto (JPG o PNG, máx. 10 MB)');
    const base = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    return this.service.agregarFoto(req.user.sub, `${base}/uploads/${foto.filename}`);
  }

  // Debe ir antes de ":indice" para que "orden" no se tome como número
  @Put('fotos/orden')
  ordenar(@Req() req: Req_, @Body() dto: OrdenFotosDto) {
    return this.service.ordenarFotos(req.user.sub, dto.orden);
  }

  @Delete('fotos/:indice')
  quitar(@Req() req: Req_, @Param('indice', ParseIntPipe) indice: number) {
    return this.service.quitarFoto(req.user.sub, indice);
  }
}

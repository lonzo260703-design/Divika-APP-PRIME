import { BadRequestException, Body, Controller, Delete, Get, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ActualizarCuentaDto, CambiarContrasenaDto, PedirCodigoTelefonoDto, PreferenciasDto, ReporteDto, VerificarTelefonoDto } from './dto';
import { CARPETA_AVATARES, CuentaService } from './cuenta.service';

type Req_ = { user: { sub: number } };

const subida = FileInterceptor('foto', {
  storage: diskStorage({
    destination: CARPETA_AVATARES,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpeg|png)$/.test(file.mimetype) ? cb(null, true) : cb(new BadRequestException('Solo se aceptan fotos JPG o PNG'), false),
});

@UseGuards(JwtAuthGuard)
@Controller('cuenta')
export class CuentaController {
  constructor(private service: CuentaService) {}

  @Get() obtener(@Req() req: Req_) { return this.service.obtener(req.user.sub); }

  @Put() actualizar(@Req() req: Req_, @Body() dto: ActualizarCuentaDto) { return this.service.actualizar(req.user.sub, dto); }

  // multipart/form-data con el campo "foto" (JPG o PNG, máx. 10 MB)
  @Post('foto')
  @UseInterceptors(subida)
  subirFoto(@Req() req: Req_, @UploadedFile() foto?: Express.Multer.File) {
    if (!foto) throw new BadRequestException('Selecciona una foto (JPG o PNG, máx. 10 MB)');
    const base = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    return this.service.cambiarFoto(req.user.sub, `${base}/uploads/${foto.filename}`);
  }

  @Delete('foto') quitarFoto(@Req() req: Req_) { return this.service.cambiarFoto(req.user.sub, null); }

  @Post('contrasena') contrasena(@Req() req: Req_, @Body() dto: CambiarContrasenaDto) { return this.service.cambiarContrasena(req.user.sub, dto); }

  @Post('telefono/codigo') pedirCodigo(@Req() req: Req_, @Body() dto: PedirCodigoTelefonoDto) { return this.service.pedirCodigoTelefono(req.user.sub, dto.telefono); }

  @Post('telefono/verificar') verificar(@Req() req: Req_, @Body() dto: VerificarTelefonoDto) { return this.service.verificarTelefono(req.user.sub, dto.telefono, dto.codigo); }

  @Get('preferencias') preferencias(@Req() req: Req_) { return this.service.preferencias(req.user.sub); }

  @Put('preferencias') guardarPreferencias(@Req() req: Req_, @Body() dto: PreferenciasDto) { return this.service.guardarPreferencias(req.user.sub, dto); }

  @Get('datos') datos(@Req() req: Req_) { return this.service.exportarDatos(req.user.sub); }

  @Delete() eliminar(@Req() req: Req_) { return this.service.eliminar(req.user.sub); }
}

@UseGuards(JwtAuthGuard)
@Controller('soporte')
export class SoporteController {
  constructor(private service: CuentaService) {}

  @Post('reportes') reportar(@Req() req: Req_, @Body() dto: ReporteDto) { return this.service.reportar(req.user.sub, dto); }
}

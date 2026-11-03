import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
// MODIFICACIÓN: Importamos los nuevos DTOs necesarios para los endpoints de Google, Apple y OTP
import { LoginDto, RegistroClienteDto, RegistroNegocioDto, GoogleLoginDto, AppleLoginDto, EnviarOtpDto, VerificarOtpDto } from './dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('registro/cliente')
  registrarCliente(@Body() dto: RegistroClienteDto) {
    return this.service.registrarCliente(dto);
  }

  @Post('registro/negocio')
  registrarNegocio(@Body() dto: RegistroNegocioDto) {
    return this.service.registrarNegocio(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { sub: number } }) {
    return this.service.perfil(req.user.sub);
  }

  // ==========================================
  // NUEVOS ENDPOINTS AÑADIDOS PARA GOOGLE, APPLE Y OTP:
  // ==========================================

  // MODIFICACIÓN: Endpoint POST para autenticación con Google
  @Post('google')
  loginGoogle(@Body() dto: GoogleLoginDto) {
    return this.service.loginGoogle(dto);
  }

  // MODIFICACIÓN: Endpoint POST para autenticación con Apple
  @Post('apple')
  loginApple(@Body() dto: AppleLoginDto) {
    return this.service.loginApple(dto);
  }

  // MODIFICACIÓN: Endpoint POST para solicitar el envío del código OTP (requiere estar autenticado)
  @UseGuards(JwtAuthGuard)
  @Post('otp/enviar')
  enviarOtp(@Req() req: { user: { sub: number } }, @Body() dto: EnviarOtpDto) {
    return this.service.enviarOtp(req.user.sub, dto);
  }

  // MODIFICACIÓN: Endpoint POST para verificar el código OTP ingresado (requiere estar autenticado)
  @UseGuards(JwtAuthGuard)
  @Post('otp/verificar')
  verificarOtp(@Req() req: { user: { sub: number } }, @Body() dto: VerificarOtpDto) {
    return this.service.verificarOtp(req.user.sub, dto);
  }
}

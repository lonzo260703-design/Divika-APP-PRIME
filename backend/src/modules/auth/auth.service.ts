import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
// MODIFICACIÓN: Importamos los nuevos DTOs creados en el paso anterior
import { LoginDto, RegistroClienteDto, RegistroNegocioDto, GoogleLoginDto, AppleLoginDto, EnviarOtpDto, VerificarOtpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usuarios: UsuariosService,
    private jwt: JwtService,
    private dataSource: DataSource,
  ) {}

  async registrarCliente(dto: RegistroClienteDto) {
    await this.verificarEmailLibre(dto.email);
    const usuario = await this.usuarios.crear({
      nombre: dto.nombre,
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
      rol: 'cliente',
    });
    return this.respuesta(usuario);
  }

  // Crea el usuario y su negocio en una sola transacción SQL:
  // si algo falla, no se guarda ninguno de los dos.
  async registrarNegocio(dto: RegistroNegocioDto) {
    await this.verificarEmailLibre(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.dataSource.transaction(async (m) => {
      const nuevo = await m.save(
        m.create(Usuario, { nombre: dto.nombreLocal, email: dto.email.toLowerCase(), passwordHash, rol: 'negocio' }),
      );
      await m.save(
        m.create(Negocio, {
          nombre: dto.nombreLocal,
          categoria: dto.categoria,
          telefono: dto.telefono,
          direccion: dto.direccion,
          horario: dto.horario?.trim() || null,
          owner: nuevo,
        }),
      );
      return nuevo;
    });
    return this.respuesta(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.buscarPorEmail(dto.email);
    // MODIFICACIÓN: Validamos si tiene passwordHash (por si acaso el usuario se creó por Google/Apple)
    const ok = usuario && usuario.passwordHash && (await bcrypt.compare(dto.password, usuario.passwordHash));
    if (!usuario || !ok) throw new UnauthorizedException('Correo o contraseña incorrectos');
    return this.respuesta(usuario);
  }

  async perfil(id: number) {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new UnauthorizedException();
    return this.datosPublicos(usuario);
  }

  private async verificarEmailLibre(email: string) {
    if (await this.usuarios.buscarPorEmail(email)) {
      throw new ConflictException('Ese correo ya está registrado');
    }
  }

  private datosPublicos(u: Usuario) {
    return { 
      id: u.id, 
      nombre: u.nombre, 
      email: u.email, 
      rol: u.rol,
      // MODIFICACIÓN: Devolvemos también el estado de validación del teléfono en el perfil
      telefono: u.telefono,
      telefonoVerificado: u.telefonoVerificado 
    };
  }

  private async respuesta(usuario: Usuario) {
    const token = await this.jwt.signAsync({ sub: usuario.id, rol: usuario.rol });
    return { token, usuario: this.datosPublicos(usuario) };
  }

  // ==========================================
  // NUEVOS MÉTODOS AÑADIDOS PARA GOOGLE, APPLE Y OTP:
  // ==========================================

  // MODIFICACIÓN: Autenticación o registro mediante Google OAuth
  async loginGoogle(dto: GoogleLoginDto) {
    // Nota: Aquí deberías validar el token con la librería oficial de Google (ej. google-auth-library).
    // Por simplicidad y estructura base, simulamos la extracción del email y nombre desde el token o payload decodificado.
    // Ejemplo real: const ticket = await googleClient.verifyIdToken({ idToken: dto.token }); const payload = ticket.getPayload();
    
    // Simulación de datos extraídos (en producción usa la librería de Google):
    const emailSimulado = "usuario.google@ejemplo.com"; 
    const nombreSimulado = "Usuario Google";
    const googleIdSimulado = dto.token; // Usar el ID real que provea Google

    let usuario = await this.usuarios.buscarPorGoogleId(googleIdSimulado);
    if (!usuario) {
      // Si no existe por googleId, revisamos si ya existe por email
      usuario = await this.usuarios.buscarPorEmail(emailSimulado);
      if (usuario) {
        // Asociamos Google ID a la cuenta existente
        await this.usuarios.actualizar(usuario.id, { googleId: googleIdSimulado });
      } else {
        // Creamos nuevo usuario
        usuario = await this.usuarios.crear({
          nombre: nombreSimulado,
          email: emailSimulado.toLowerCase(),
          googleId: googleIdSimulado,
          rol: 'cliente',
          passwordHash: null as any,
        });
      }
    }
    return this.respuesta(usuario);
  }

  // MODIFICACIÓN: Autenticación o registro mediante Apple Sign-In
  async loginApple(dto: AppleLoginDto) {
    // Nota: Aquí se validaría el token JWT de Apple usando apple-auth o jsonwebtoken con las llaves públicas de Apple.
    const emailSimulado = "usuario.apple@ejemplo.com";
    const nombreSimulado = dto.nombre || "Usuario Apple";
    const appleIdSimulado = dto.token; // Usar el ID único real de Apple

    let usuario = await this.usuarios.buscarPorAppleId(appleIdSimulado);
    if (!usuario) {
      usuario = await this.usuarios.buscarPorEmail(emailSimulado);
      if (usuario) {
        await this.usuarios.actualizar(usuario.id, { appleId: appleIdSimulado });
      } else {
        usuario = await this.usuarios.crear({
          nombre: nombreSimulado,
          email: emailSimulado.toLowerCase(),
          appleId: appleIdSimulado,
          rol: 'cliente',
          passwordHash: null as any,
        });
      }
    }
    return this.respuesta(usuario);
  }

  // MODIFICACIÓN: Enviar código OTP por SMS / WhatsApp
  async enviarOtp(userId: number, dto: EnviarOtpDto) {
    const usuario = await this.usuarios.buscarPorId(userId);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    // Generar código aleatorio de 6 dígitos
    const codigoOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiración en 10 minutos
    const otpExpiraEn = new Date(Date.now() + 10 * 60 * 1000);

    // Guardar teléfono y código en el usuario
    await this.usuarios.actualizar(userId, {
      telefono: dto.telefono,
      codigoOtp,
      otpExpiraEn,
      telefonoVerificado: false,
    });

    // INTEGRACIÓN CON PROVEEDOR DE SMS/WHATSAPP (ej. Twilio):
    // Aquí puedes integrar tu cliente de Twilio o servicio de mensajería:
    // await twilioClient.messages.create({ body: `Tu código Divika es: ${codigoOtp}`, from: '...', to: dto.telefono });
    console.log(`[OTP SIMULADO] Código para ${dto.telefono}: ${codigoOtp}`);

    return { mensaje: 'Código OTP enviado correctamente al teléfono' };
  }

  // MODIFICACIÓN: Verificar el código OTP ingresado por el usuario
  async verificarOtp(userId: number, dto: VerificarOtpDto) {
    const usuario = await this.usuarios.buscarPorId(userId);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    if (usuario.telefono !== dto.telefono) {
      throw new BadRequestException('El número de teléfono no coincide con la solicitud');
    }

    if (!usuario.codigoOtp || usuario.codigoOtp !== dto.codigo) {
      throw new BadRequestException('Código OTP incorrecto');
    }

    if (usuario.otpExpiraEn && new Date() > new Date(usuario.otpExpiraEn)) {
      throw new BadRequestException('El código OTP ha expirado');
    }

    // Marcar teléfono como verificado y limpiar el código temporal
    await this.usuarios.actualizar(userId, {
      telefonoVerificado: true,
      codigoOtp: null as any,
      otpExpiraEn: null as any,
    });

    return { mensaje: 'Teléfono verificado correctamente', telefonoVerificado: true };
  }
}

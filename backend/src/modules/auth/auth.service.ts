import { randomInt } from 'crypto';
import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { isEmail } from 'class-validator';
import { DataSource } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
// MODIFICACIÓN: Importamos los nuevos DTOs creados en el paso anterior
import { LoginDto, RegistroClienteDto, RegistroNegocioDto, GoogleLoginDto, AppleLoginDto, EnviarOtpDto, VerificarOtpDto, EnviarCodigoDto, VerificarCodigoDto } from './dto';

const INTENTOS_MAX = 5;
const ESPERA_REENVIO_SEG = 60;
const VIGENCIA_CODIGO_MIN = 10;

@Injectable()
export class AuthService {
  constructor(
    private usuarios: UsuariosService,
    private jwt: JwtService,
    private dataSource: DataSource,
  ) {}

  async registrarCliente(dto: RegistroClienteDto) {
    await this.verificarEmailLibre(dto.email);
    const telefono = this.normalizarTelefono(dto.telefono);
    if (await this.usuarios.buscarPorTelefono(telefono)) {
      throw new ConflictException('Ese teléfono ya está registrado');
    }
    const usuario = await this.usuarios.crear({
      nombre: dto.nombre,
      telefono,
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
  // ACCESO POR CÓDIGO (SMS o correo)
  // ==========================================

  // Pide un código de 4 dígitos. Responde igual exista o no la cuenta, para no revelar quién está registrado.
  async enviarCodigo(dto: EnviarCodigoDto) {
    const usuario = await this.buscarPorDestino(dto);
    if (usuario) {
      await this.emitirCodigo(usuario, dto.destino);
    } else {
      console.log(`[CÓDIGO SIMULADO] No hay una cuenta con ${dto.destino}; no se envió nada`);
    }
    return { enviado: true, segundosEspera: ESPERA_REENVIO_SEG };
  }

  // Valida el código y, si es correcto, inicia sesión (devuelve token + usuario)
  async verificarCodigo(dto: VerificarCodigoDto) {
    const usuario = await this.buscarPorDestino(dto);
    if (!usuario) throw new BadRequestException('Código incorrecto');
    await this.comprobarCodigo(usuario, dto.codigo);
    const actualizado = dto.canal === 'sms'
      ? await this.usuarios.actualizar(usuario.id, { telefonoVerificado: true })
      : usuario;
    return this.respuesta(actualizado ?? usuario);
  }

  // Quita espacios, guiones y el prefijo +52 / 52 / 521: deja solo los 10 dígitos
  private normalizarTelefono(telefono: string) {
    let d = telefono.replace(/\D/g, '');
    if (d.length === 13 && d.startsWith('521')) d = d.slice(3);
    else if (d.length === 12 && d.startsWith('52')) d = d.slice(2);
    return d;
  }

  private async buscarPorDestino({ canal, destino }: EnviarCodigoDto) {
    if (canal === 'email') {
      if (!isEmail(destino.trim())) throw new BadRequestException('Correo no válido');
      return this.usuarios.buscarPorEmail(destino.trim());
    }
    const telefono = this.normalizarTelefono(destino);
    if (!/^\d{10}$/.test(telefono)) {
      throw new BadRequestException('Teléfono inválido. Verifica que el número sea correcto');
    }
    return this.usuarios.buscarPorTelefono(telefono);
  }

  // Genera el código, guarda solo su hash y lo "envía". Limita reenvíos a uno por minuto.
  private async emitirCodigo(usuario: Usuario, destinoLog: string) {
    if (usuario.otpEnviadoEn) {
      const pasaron = (Date.now() - new Date(usuario.otpEnviadoEn).getTime()) / 1000;
      if (pasaron < ESPERA_REENVIO_SEG) {
        const faltan = Math.ceil(ESPERA_REENVIO_SEG - pasaron);
        throw new HttpException(`Puedes pedir otro código en ${faltan} segundos`, HttpStatus.TOO_MANY_REQUESTS);
      }
    }
    const codigo = randomInt(0, 10000).toString().padStart(4, '0');
    await this.usuarios.actualizar(usuario.id, {
      codigoOtp: await bcrypt.hash(codigo, 8),
      otpExpiraEn: new Date(Date.now() + VIGENCIA_CODIGO_MIN * 60 * 1000),
      otpIntentos: 0,
      otpEnviadoEn: new Date(),
    });
    // INTEGRACIÓN CON PROVEEDOR (Twilio para SMS/WhatsApp, o correo): se enviaría aquí.
    // Por ahora el código solo se imprime en la consola del backend.
    console.log(`[CÓDIGO SIMULADO] Código para ${destinoLog}: ${codigo}`);
  }

  // Revisa vigencia, intentos y coincidencia; si todo está bien, consume el código
  private async comprobarCodigo(usuario: Usuario, codigo: string) {
    if (!usuario.codigoOtp || !usuario.otpExpiraEn || new Date() > new Date(usuario.otpExpiraEn)) {
      throw new BadRequestException('El código expiró. Solicita uno nuevo');
    }
    if (usuario.otpIntentos >= INTENTOS_MAX) {
      throw new BadRequestException('Demasiados intentos. Solicita un código nuevo');
    }
    if (!(await bcrypt.compare(codigo, usuario.codigoOtp))) {
      await this.usuarios.actualizar(usuario.id, { otpIntentos: usuario.otpIntentos + 1 });
      throw new BadRequestException('Código incorrecto');
    }
    await this.usuarios.actualizar(usuario.id, {
      codigoOtp: null as any,
      otpExpiraEn: null as any,
      otpIntentos: 0,
    });
  }

  // ==========================================
  // GOOGLE Y APPLE: PENDIENTES
  // ==========================================
  // Antes estaban simulados (aceptaban cualquier token y entraban a una cuenta fija), lo que permitía
  // iniciar sesión sin credenciales. Quedan desactivados hasta validar el token con la librería oficial
  // (google-auth-library / verificación del JWT de Apple).

  loginGoogle(_dto: GoogleLoginDto): never {
    throw new NotImplementedException('Inicio de sesión con Google disponible próximamente');
  }

  loginApple(_dto: AppleLoginDto): never {
    throw new NotImplementedException('Inicio de sesión con Apple disponible próximamente');
  }

  // ==========================================
  // VERIFICAR TELÉFONO CON SESIÓN YA INICIADA (OTP)
  // ==========================================

  async enviarOtp(userId: number, dto: EnviarOtpDto) {
    const usuario = await this.usuarios.buscarPorId(userId);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    const telefono = this.normalizarTelefono(dto.telefono);
    const actualizado = await this.usuarios.actualizar(userId, { telefono, telefonoVerificado: false });
    await this.emitirCodigo(actualizado ?? usuario, telefono);
    return { mensaje: 'Código enviado correctamente al teléfono', segundosEspera: ESPERA_REENVIO_SEG };
  }

  async verificarOtp(userId: number, dto: VerificarOtpDto) {
    const usuario = await this.usuarios.buscarPorId(userId);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    if (usuario.telefono !== this.normalizarTelefono(dto.telefono)) {
      throw new BadRequestException('El número de teléfono no coincide con la solicitud');
    }
    await this.comprobarCodigo(usuario, dto.codigo);
    await this.usuarios.actualizar(userId, { telefonoVerificado: true });
    return { mensaje: 'Teléfono verificado correctamente', telefonoVerificado: true };
  }
}

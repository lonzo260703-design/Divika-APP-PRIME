import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { CATEGORIAS } from '../negocios/categorias';

export class LoginDto {
  @IsEmail({}, { message: 'Correo no válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Escribe tu contraseña' })
  password: string;
}

export class RegistroClienteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEmail({}, { message: 'Correo no válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  password: string;
}

export class RegistroNegocioDto {
  @IsEmail({}, { message: 'Correo no válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del local es obligatorio' })
  nombreLocal: string;

  @IsIn(CATEGORIAS as unknown as string[], { message: 'Elige una categoría válida' })
  categoria: string;

  @Matches(/^[0-9+()\-\s]{7,20}$/, { message: 'Teléfono no válido' })
  telefono: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsOptional()
  @IsString()
  horario?: string;
}

// ==========================================
// NUEVOS DTOS AÑADIDOS PARA GOOGLE, APPLE Y OTP:
// ==========================================

// MODIFICACIÓN: DTO para recibir el token de autenticación de Google desde el frontend
export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El token de Google es obligatorio' })
  token: string;
}

// MODIFICACIÓN: DTO para recibir el token o credenciales de Apple desde el frontend
export class AppleLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El token de Apple es obligatorio' })
  token: string;

  @IsOptional()
  @IsString()
  nombre?: string; // Apple a veces solo manda el nombre en el primer registro
}

// MODIFICACIÓN: DTO para solicitar el envío del código OTP a un número de teléfono
export class EnviarOtpDto {
  @Matches(/^[0-9+()\-\s]{7,20}$/, { message: 'Número de teléfono no válido' })
  telefono: string;
}

// MODIFICACIÓN: DTO para verificar el código OTP ingresado por el usuario
export class VerificarOtpDto {
  @Matches(/^[0-9+()\-\s]{7,20}$/, { message: 'Número de teléfono no válido' })
  telefono: string;

  @IsString()
  @IsNotEmpty({ message: 'El código OTP es obligatorio' })
  codigo: string;
}

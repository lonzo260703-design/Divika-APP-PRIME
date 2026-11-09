import { IsEmail, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export const TIPOS_PROBLEMA = ['aplicacion', 'reserva', 'pagos', 'cancelaciones', 'servicio', 'otro'] as const;

export class ActualizarCuentaDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: 'El nombre es obligatorio' }) @MaxLength(120)
  nombre?: string;

  @IsOptional() @IsEmail({}, { message: 'Correo no válido' })
  email?: string;

  @IsOptional() @Matches(/^(\d{4}-\d{2}-\d{2})?$/, { message: 'Fecha de nacimiento no válida' })
  fechaNacimiento?: string;

  @IsOptional() @IsString() @MaxLength(80)
  ciudad?: string;
}

export class CambiarContrasenaDto {
  @IsString() @IsNotEmpty({ message: 'Escribe tu contraseña actual' })
  actual: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, { message: 'La contraseña nueva debe tener 8 caracteres o más, una mayúscula y un número' })
  nueva: string;
}

export class PedirCodigoTelefonoDto {
  @Matches(/^[0-9+()\-\s]{10,20}$/, { message: 'Teléfono no válido' })
  telefono: string;
}

export class VerificarTelefonoDto extends PedirCodigoTelefonoDto {
  @Matches(/^\d{4}$/, { message: 'El código tiene 4 dígitos' })
  codigo: string;
}

export class PreferenciasDto {
  @IsOptional() @IsObject()
  notificaciones?: Record<string, boolean>;

  @IsOptional() @IsObject()
  privacidad?: Record<string, boolean>;
}

export class ReporteDto {
  @IsIn(TIPOS_PROBLEMA, { message: 'Elige un tipo de problema' })
  tipo: string;

  @IsString() @IsNotEmpty({ message: 'Describe el problema' }) @MaxLength(1000, { message: 'La descripción puede tener máximo 1000 caracteres' })
  descripcion: string;
}

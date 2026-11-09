import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { CATEGORIAS } from '../negocios/categorias';

export const METODOS_PAGO = ['efectivo', 'transferencia', 'tarjeta'];

export class CoberturaDto {
  @IsInt({ message: 'El radio debe ser un número entero de km' })
  @Min(1, { message: 'El radio mínimo es 1 km' })
  @Max(100, { message: 'El radio máximo es 100 km' })
  radioKm: number;

  @IsArray()
  @ArrayMaxSize(15, { message: 'Máximo 15 zonas' })
  @IsString({ each: true })
  @MaxLength(60, { each: true, message: 'Cada zona puede tener máximo 60 caracteres' })
  zonas: string[];
}

// Lo que el proveedor puede editar en "Perfil del negocio"
export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
  @MaxLength(120, { message: 'El nombre es demasiado largo' })
  nombre?: string;

  @IsOptional()
  @IsIn(CATEGORIAS, { message: 'Elige una categoría válida' })
  categoria?: string;

  @IsOptional()
  @IsString()
  subcategoria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600, { message: 'La descripción puede tener máximo 600 caracteres' })
  descripcion?: string;

  @IsOptional()
  @Matches(/^[0-9+()\-\s]{7,20}$/, { message: 'Teléfono no válido' })
  telefono?: string;

  @IsOptional()
  @Matches(/^([0-9+()\-\s]{7,20})?$/, { message: 'WhatsApp no válido' })
  whatsapp?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo público no válido' })
  emailPublico?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  colonia?: string;

  @IsOptional()
  @IsArray()
  @IsIn(METODOS_PAGO, { each: true, message: 'Método de pago no válido' })
  metodosPago?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CoberturaDto)
  cobertura?: CoberturaDto;
}

export class OrdenFotosDto {
  @IsArray()
  @IsInt({ each: true })
  orden: number[];
}

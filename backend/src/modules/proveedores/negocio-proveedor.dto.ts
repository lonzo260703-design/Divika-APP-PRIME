import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsNumber, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
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

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'La calle y número pueden tener máximo 160 caracteres' })
  calle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Las referencias pueden tener máximo 300 caracteres' })
  referencias?: string;

  @IsOptional()
  @IsBoolean()
  atiendeDomicilio?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Latitud no válida' })
  @Min(-90) @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitud no válida' })
  @Min(-180) @Max(180)
  longitud?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las instrucciones de pago pueden tener máximo 500 caracteres' })
  instruccionesPago?: string;

  @IsOptional()
  @IsBoolean()
  mostrarPagoPerfil?: boolean;
}

export class OrdenFotosDto {
  @IsArray()
  @IsInt({ each: true })
  orden: number[];
}

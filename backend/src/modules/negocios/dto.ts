import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, IsNumber, IsObject } from 'class-validator';
import { CATEGORIAS } from './categorias';

export class CrearNegocioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
  nombre: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(13, { message: 'El RFC no debe exceder 13 caracteres' })
  rfc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción corta no debe exceder 255 caracteres' })
  descripcionCorta?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número válido' })
  latitud?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número válido' })
  longitud?: number;

  @IsOptional()
  @IsObject({ message: 'El formato de los horarios debe ser un objeto JSON válido' })
  horariosJson?: Record<string, { apertura: string; cierre: string; cerrado: boolean }>;
}

export class ActualizarNegocioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsIn(CATEGORIAS as unknown as string[], { message: 'Elige una categoría válida' })
  categoria?: string;

  @IsOptional()
  @Matches(/^[0-9+()\-\s]{7,20}$/, { message: 'Teléfono no válido' })
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  horario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(13, { message: 'El RFC no debe exceder 13 caracteres' })
  rfc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción corta no debe exceder 255 caracteres' })
  descripcionCorta?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número válido' })
  latitud?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número válido' })
  longitud?: number;

  @IsOptional()
  @IsObject({ message: 'El formato de los horarios debe ser un objeto JSON válido' })
  horariosJson?: Record<string, { apertura: string; cierre: string; cerrado: boolean }>;
}

import { IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { CATEGORIAS } from '../negocios/categorias';

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
}

export class OrdenFotosDto {
  @IsArray()
  @IsInt({ each: true })
  orden: number[];
}

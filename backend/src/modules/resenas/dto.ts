import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CrearResenaDto {
  @IsNumber({}, { message: 'El ID del negocio debe ser un número válido' })
  @IsNotEmpty({ message: 'El ID del negocio es obligatorio' })
  negocioId: number;

  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  calificacion: number;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser texto' })
  comentario?: string;
}

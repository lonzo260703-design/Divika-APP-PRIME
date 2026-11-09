import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { METODOS_PAGO } from '../proveedores/negocio-proveedor.dto';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ServicioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del servicio es obligatorio' })
  @MaxLength(80, { message: 'El nombre puede tener máximo 80 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(400, { message: 'La descripción puede tener máximo 400 caracteres' })
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Max(1000000, { message: 'El precio es demasiado alto' })
  precio?: number | null;

  @Type(() => Number)
  @IsInt({ message: 'La duración debe ser en minutos enteros' })
  @Min(5, { message: 'La duración mínima es 5 minutos' })
  @Max(720, { message: 'La duración máxima es 12 horas' })
  duracionMin: number;

  @IsOptional()
  activo?: boolean;
}

export class CrearCitaDto {
  @IsInt()
  negocioId: number;

  @IsOptional()
  @IsInt()
  servicioId?: number;

  @Matches(FECHA, { message: 'Fecha no válida' })
  fecha: string;

  @Matches(HORA, { message: 'Hora no válida' })
  hora: string;

  @IsInt()
  @Min(1, { message: 'Mínimo 1 persona' })
  @Max(20, { message: 'Máximo 20 personas' })
  personas: number;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Las notas pueden tener máximo 300 caracteres' })
  notas?: string;

  @IsOptional()
  @IsIn(METODOS_PAGO, { message: 'Método de pago no válido' })
  metodoPago?: string;
}

export class ProponerHorarioDto {
  @Matches(FECHA, { message: 'Fecha no válida' })
  fecha: string;

  @Matches(HORA, { message: 'Hora no válida' })
  hora: string;
}

export class MensajeDto {
  @IsString()
  @IsNotEmpty({ message: 'Escribe un mensaje' })
  @MaxLength(1000, { message: 'El mensaje puede tener máximo 1000 caracteres' })
  texto: string;
}

export class RespuestaResenaDto {
  @IsString()
  @IsNotEmpty({ message: 'Escribe tu respuesta' })
  @MaxLength(500, { message: 'La respuesta puede tener máximo 500 caracteres' })
  texto: string;
}

import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsObject, ValidateNested, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
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

  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'La categoría puede tener máximo 60 caracteres' })
  categoria?: string;

  @IsOptional()
  @IsIn(['local', 'domicilio', 'ambos'], { message: 'Modalidad no válida' })
  modalidad?: 'local' | 'domicilio' | 'ambos';

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El costo de traslado debe ser un número' })
  @Min(0, { message: 'El costo de traslado no puede ser negativo' })
  @Max(100000, { message: 'El costo de traslado es demasiado alto' })
  costoTraslado?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(400, { message: 'Las indicaciones pueden tener máximo 400 caracteres' })
  indicaciones?: string;
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

export class ReglasDto {
  @IsInt() @Min(15, { message: 'La duración base mínima es 15 minutos' }) @Max(480, { message: 'La duración base máxima es 8 horas' })
  duracionBase: number;

  @IsIn([15, 30, 60], { message: 'El intervalo debe ser de 15, 30 o 60 minutos' })
  intervaloMin: number;

  @IsInt() @Min(0) @Max(168, { message: 'La anticipación máxima es de 168 horas' })
  anticipacionHoras: number;

  @IsInt() @Min(1) @Max(180, { message: 'Máximo 180 días hacia adelante' })
  maxDias: number;
}

export class BloqueoDto {
  @Matches(FECHA, { message: 'Fecha inicial no válida' }) desde: string;
  @Matches(FECHA, { message: 'Fecha final no válida' }) hasta: string;
  @IsOptional() @IsString() @MaxLength(60, { message: 'El motivo puede tener máximo 60 caracteres' }) motivo?: string;
}

export class DisponibilidadDto {
  @IsOptional() @IsObject()
  horarios?: Record<string, { apertura: string; cierre: string; cerrado: boolean }>;

  @IsOptional() @ValidateNested() @Type(() => ReglasDto)
  reglas?: ReglasDto;

  @IsOptional() @IsArray() @ArrayMaxSize(30, { message: 'Máximo 30 bloqueos' }) @ValidateNested({ each: true }) @Type(() => BloqueoDto)
  bloqueos?: BloqueoDto[];
}

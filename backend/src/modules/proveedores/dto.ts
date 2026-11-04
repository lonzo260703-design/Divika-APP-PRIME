import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearInteresadoDto {
  @IsString({ message: 'El nombre del negocio debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
  @MaxLength(120, { message: 'El nombre del negocio es demasiado largo' })
  nombreNegocio: string;

  @IsString({ message: 'El servicio debe ser texto' })
  @IsNotEmpty({ message: 'Indica qué servicio ofreces' })
  @MaxLength(120, { message: 'El servicio es demasiado largo' })
  servicio: string;

  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(30, { message: 'El teléfono es demasiado largo' })
  telefono: string;

  @IsString({ message: 'La ciudad debe ser texto' })
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @MaxLength(80, { message: 'La ciudad es demasiado larga' })
  ciudad: string;
}

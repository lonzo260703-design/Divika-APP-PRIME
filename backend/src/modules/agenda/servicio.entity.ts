import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  // Precio en pesos; nulo = "a consultar"
  @Column({ type: 'float', nullable: true })
  precio: number | null;

  @Column({ type: 'int', default: 60 })
  duracionMin: number;

  @Column({ type: 'varchar', nullable: true })
  categoria: string | null;

  // local = en el negocio, domicilio = el negocio va con el cliente, ambos
  @Column({ type: 'varchar', default: 'local' })
  modalidad: 'local' | 'domicilio' | 'ambos';

  // Costo extra por ir al domicilio (nulo = sin costo)
  @Column({ type: 'float', nullable: true })
  costoTraslado: number | null;

  @Column({ type: 'text', nullable: true })
  indicaciones: string | null;

  @Column({ type: 'varchar', nullable: true })
  fotoUrl: string | null;

  // Un servicio inactivo no se muestra a los clientes
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => Negocio, { onDelete: 'CASCADE' })
  negocio: Negocio;

  @CreateDateColumn()
  creadoEn: Date;
}

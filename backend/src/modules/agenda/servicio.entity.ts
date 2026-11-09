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

  // Un servicio inactivo no se muestra a los clientes
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ManyToOne(() => Negocio, { onDelete: 'CASCADE' })
  negocio: Negocio;

  @CreateDateColumn()
  creadoEn: Date;
}

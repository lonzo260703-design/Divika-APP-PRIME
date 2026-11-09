import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Servicio } from './servicio.entity';

// solicitada: espera respuesta del negocio · propuesta: el negocio sugirió otro horario y espera al cliente
export type EstadoCita = 'solicitada' | 'confirmada' | 'propuesta' | 'rechazada' | 'cancelada';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Negocio, { onDelete: 'CASCADE', eager: true })
  negocio: Negocio;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', eager: true })
  cliente: Usuario;

  @ManyToOne(() => Servicio, { nullable: true, onDelete: 'SET NULL', eager: true })
  servicio: Servicio | null;

  @Column({ type: 'varchar' })
  fecha: string; // AAAA-MM-DD

  @Column({ type: 'varchar' })
  hora: string; // HH:MM

  @Column({ type: 'int', default: 1 })
  personas: number;

  @Column({ type: 'text', nullable: true })
  notas: string | null;

  // Cómo piensa pagar el cliente (informativo: Divika no procesa pagos)
  @Column({ type: 'varchar', nullable: true })
  metodoPago: string | null;

  @Column({ type: 'varchar', default: 'solicitada' })
  estado: EstadoCita;

  @Column({ type: 'varchar', nullable: true })
  propuestaFecha: string | null;

  @Column({ type: 'varchar', nullable: true })
  propuestaHora: string | null;

  @CreateDateColumn()
  creadoEn: Date;
}

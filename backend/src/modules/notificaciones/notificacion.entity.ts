import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

export type TipoNotificacion = 'cita' | 'mensaje' | 'resena';

// Aviso dentro de la app para un usuario (cliente o dueño de negocio)
@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @Column({ type: 'varchar' })
  tipo: TipoNotificacion;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'varchar', nullable: true })
  detalle: string | null;

  // Ruta del front a la que lleva el aviso
  @Column({ type: 'varchar', nullable: true })
  enlace: string | null;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}

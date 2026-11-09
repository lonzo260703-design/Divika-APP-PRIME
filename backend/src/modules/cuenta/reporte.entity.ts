import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

// Reporte de problema que envía un usuario desde "Soporte y ayuda"
@Entity('reportes_problema')
export class ReporteProblema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @CreateDateColumn()
  creadoEn: Date;
}

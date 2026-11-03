
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('negocios')
export class Negocio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  rfc: string | null;

  @Column({ type: 'varchar', nullable: true })
  descripcionCorta: string | null;

  @Column()
  categoria: string;

  @Column()
  telefono: string;

  @Column()
  direccion: string;

  @Column({ type: 'float', nullable: true })
  latitud: number | null;

  @Column({ type: 'float', nullable: true })
  longitud: number | null;

  @Column({ type: 'json', nullable: true })
  horariosJson: Record<string, { apertura: string; cierre: string; cerrado: boolean }> | null;

  @Column({ type: 'varchar', nullable: true })
  horario: string | null;

  @Column({ type: 'float', default: 5 })
  calificacion: number;

  @Column({ type: 'varchar', nullable: true })
  imagenUrl: string | null;

  // Métricas y Fotos (Persona 5)
  @Column({ type: 'int', default: 0 })
  clicsWhatsapp: number;

  @Column({ type: 'int', default: 0 })
  clicsLlamada: number;

  @Column({ type: 'json', nullable: true })
  galeria: string[] | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  owner: Usuario | null;

  @CreateDateColumn()
  creadoEn: Date;
}

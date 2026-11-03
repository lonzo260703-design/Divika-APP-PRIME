import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Negocio } from '../negocios/negocio.entity';

@Entity('resenas')
export class Resena {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  calificacion: number; // Ej. de 1 a 5 estrellas

  @Column({ type: 'text', nullable: true })
  comentario: string;

  // Relación con el usuario que redacta la reseña (asegura que sea un usuario válido/autenticado)
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  // Relación con el negocio calificado
  @ManyToOne(() => Negocio, { onDelete: 'CASCADE' })
  negocio: Negocio;

  @CreateDateColumn()
  creadoEn: Date;
}

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Negocio } from '../negocios/negocio.entity';
import { Usuario } from '../usuarios/usuario.entity';

// Una conversación = un cliente con un negocio
@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Negocio, { onDelete: 'CASCADE' })
  negocio: Negocio;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  cliente: Usuario;

  @Column({ type: 'varchar' })
  de: 'cliente' | 'negocio';

  @Column({ type: 'text' })
  texto: string;

  // Lo leyó la otra parte
  @Column({ type: 'boolean', default: false })
  leido: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}

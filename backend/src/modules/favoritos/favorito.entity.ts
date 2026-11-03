import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Negocio } from '../negocios/negocio.entity';

@Entity('favoritos')
@Unique(['usuario', 'negocio'])
export class Favorito {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @ManyToOne(() => Negocio, { onDelete: 'CASCADE' })
  negocio: Negocio;

  @CreateDateColumn()
  creadoEn: Date;
}

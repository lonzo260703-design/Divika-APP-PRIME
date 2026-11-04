import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Contacto que deja un proveedor en la landing "Únete gratis" (sin cuenta todavía)
@Entity('interesados')
export class Interesado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombreNegocio: string;

  @Column()
  servicio: string;

  @Column()
  telefono: string;

  @Column()
  ciudad: string;

  @CreateDateColumn()
  creadoEn: Date;
}

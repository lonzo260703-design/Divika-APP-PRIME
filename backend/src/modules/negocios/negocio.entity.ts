
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

  // Descripción larga del perfil (máx. 600 caracteres); descripcionCorta es la de las cards
  @Column({ type: 'varchar', nullable: true })
  descripcion: string | null;

  @Column()
  categoria: string;

  @Column({ type: 'varchar', nullable: true })
  subcategoria: string | null;

  @Column()
  telefono: string;

  @Column()
  direccion: string;

  @Column({ type: 'varchar', nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', nullable: true })
  colonia: string | null;

  @Column({ type: 'varchar', nullable: true })
  whatsapp: string | null;

  @Column({ type: 'varchar', nullable: true })
  emailPublico: string | null;

  // 'en_proceso' (alta sin terminar), 'publicado' (visible en el directorio) o 'pausado'.
  // Solo los publicados salen en listados y búsquedas. Los negocios de ejemplo nacen publicados.
  @Column({ type: 'varchar', default: 'publicado' })
  estado: 'en_proceso' | 'publicado' | 'pausado';

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

  // Formas de pago que acepta el negocio (solo informativo: Divika no procesa pagos)
  @Column({ type: 'json', nullable: true })
  metodosPago: string[] | null;

  // Dónde atiende: radio en km y zonas/colonias extra
  @Column({ type: 'json', nullable: true })
  cobertura: { radioKm: number; zonas: string[] } | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  owner: Usuario | null;

  @CreateDateColumn()
  creadoEn: Date;
}

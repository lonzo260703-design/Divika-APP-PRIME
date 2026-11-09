
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

  // Reglas para ofrecer horas: duración base de una cita, cada cuántos minutos inicia una, anticipación mínima y hasta cuántos días adelante se reserva
  @Column({ type: 'json', nullable: true })
  disponibilidad: { duracionBase: number; intervaloMin: number; anticipacionHoras: number; maxDias: number } | null;

  // Fechas en las que no se atiende (vacaciones, mantenimiento…)
  @Column({ type: 'json', nullable: true })
  bloqueos: { desde: string; hasta: string; motivo: string }[] | null;

  // Formas de pago que acepta el negocio (solo informativo: Divika no procesa pagos)
  @Column({ type: 'json', nullable: true })
  metodosPago: string[] | null;

  // Dónde atiende: radio en km y zonas/colonias extra
  // Dirección completa y cómo llegar
  @Column({ type: 'varchar', nullable: true })
  calle: string | null;

  @Column({ type: 'varchar', nullable: true })
  referencias: string | null;

  // Si el negocio sale a atender al domicilio del cliente
  @Column({ type: 'boolean', default: false })
  atiendeDomicilio: boolean;

  // Datos para pagar (CLABE, titular...). Privado: solo se muestra si mostrarPagoPerfil
  @Column({ type: 'text', nullable: true, select: false })
  instruccionesPago: string | null;

  @Column({ type: 'boolean', default: true })
  mostrarPagoPerfil: boolean;

  // Visitas al perfil por día { 'AAAA-MM-DD': n }, últimos 30 días. Privado
  @Column({ type: 'json', nullable: true, select: false })
  visitasPorDia: Record<string, number> | null;

  @Column({ type: 'json', nullable: true })
  cobertura: { radioKm: number; zonas: string[] } | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  owner: Usuario | null;

  @CreateDateColumn()
  creadoEn: Date;
}

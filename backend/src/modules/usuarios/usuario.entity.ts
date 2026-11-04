import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Rol = 'cliente' | 'negocio';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  // MODIFICACIÓN: Hacemos opcional la contraseña porque los usuarios que se registren 
  // mediante Google o Apple no necesariamente tendrán una contraseña local (passwordHash).
  @Column({ nullable: true })
  passwordHash: string;

  // Solo proveedores (el diseño web pide nombre y apellidos por separado)
  @Column({ type: 'varchar', nullable: true })
  apellidos: string | null;

  @Column({ type: 'varchar', default: 'cliente' })
  rol: Rol;

  @CreateDateColumn()
  creadoEn: Date;

  // ==========================================
  // NUEVOS CAMPOS AÑADIDOS PARA AUTENTICACIÓN Y SEGURIDAD:
  // ==========================================

  // MODIFICACIÓN: Campo para almacenar el número de teléfono del usuario (para OTP SMS/WhatsApp)
  @Column({ nullable: true, unique: true })
  telefono: string;

  // MODIFICACIÓN: Bandera booleana para saber si el teléfono ya fue validado con éxito mediante OTP
  @Column({ default: false })
  telefonoVerificado: boolean;

  // MODIFICACIÓN: Código OTP temporal y su fecha de expiración para la validación del teléfono
  // Hash (bcrypt) del código de 4 dígitos; nunca se guarda el código en claro
  @Column({ nullable: true })
  codigoOtp: string;

  @Column({ type: 'int', default: 0 })
  otpIntentos: number;

  @Column({ type: Date, nullable: true })
  otpEnviadoEn: Date;

  @Column({ type: Date, nullable: true }) // type: Date funciona en SQLite, Postgres y MySQL
  otpExpiraEn: Date;

  // MODIFICACIÓN: Identificador único de Google para login social
  @Column({ nullable: true, unique: true })
  googleId: string;

  // MODIFICACIÓN: Identificador único de Apple para login social
  @Column({ nullable: true, unique: true })
  appleId: string;
}

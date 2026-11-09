import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { NegociosModule } from './modules/negocios/negocios.module';
import { FavoritosModule } from './modules/favoritos/favoritos.module';
import { ResenasModule } from './modules/resenas/resenas.module';
import { CuentaModule } from './modules/cuenta/cuenta.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AgendaModule } from './modules/agenda/agenda.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lee backend/.env
    // SQLite = base de datos SQL en un solo archivo, sin instalar nada.
    // Para usar PostgreSQL o MySQL solo cambia este bloque (ver README).
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_FILE ?? 'divika.sqlite',
      autoLoadEntities: true,
      synchronize: true, // crea/ajusta las tablas solo. Útil en desarrollo, no en producción.
    }),
    UsuariosModule,
    NegociosModule,
    AuthModule,
    ResenasModule,
    FavoritosModule,
    ProveedoresModule,
    CuentaModule,
    AgendaModule,
  ],
})
export class AppModule {}

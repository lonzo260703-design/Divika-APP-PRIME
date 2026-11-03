import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(@InjectRepository(Usuario) private repo: Repository<Usuario>) {}

  buscarPorEmail(email: string) {
    return this.repo.findOneBy({ email: email.toLowerCase() });
  }

  buscarPorId(id: number) {
    return this.repo.findOneBy({ id });
  }

  crear(datos: Partial<Usuario>) {
    return this.repo.save(this.repo.create(datos));
  }

  // ==========================================
  // NUEVOS MÉTODOS AÑADIDOS PARA AUTENTICACIÓN Y SEGURIDAD:
  // ==========================================

  // MODIFICACIÓN: Método para buscar un usuario por su número de teléfono
  buscarPorTelefono(telefono: string) {
    return this.repo.findOneBy({ telefono });
  }

  // MODIFICACIÓN: Método para buscar un usuario por su ID de Google (OAuth)
  buscarPorGoogleId(googleId: string) {
    return this.repo.findOneBy({ googleId });
  }

  // MODIFICACIÓN: Método para buscar un usuario por su ID de Apple (OAuth)
  buscarPorAppleId(appleId: string) {
    return this.repo.findOneBy({ appleId });
  }

  // MODIFICACIÓN: Método genérico o específico para actualizar campos del usuario (ej. guardar OTP, verificar teléfono)
  async actualizar(id: number, datos: Partial<Usuario>) {
    await this.repo.update(id, datos);
    return this.buscarPorId(id);
  }
}

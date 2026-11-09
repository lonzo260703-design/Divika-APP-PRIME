import Link from 'next/link';
import { IconCamera } from '../ui/icons';

// Foto de perfil (o la inicial del nombre si no hay foto). Con "editarHref" muestra el icono de cámara.
export function Avatar({ nombre, url, editarHref, tamano = 'grande' }: { nombre: string; url?: string | null; editarHref?: string; tamano?: 'grande' | 'mediano' | 'chico' }) {
  return (
    <div className={`perfil-avatar perfil-avatar--${tamano}`}>
      {url ? <img src={url} alt="Foto de perfil" /> : <span aria-hidden>{nombre.trim().charAt(0).toUpperCase()}</span>}
      {editarHref && <Link href={editarHref} className="perfil-avatar__camara" aria-label="Cambiar foto"><IconCamera /></Link>}
    </div>
  );
}

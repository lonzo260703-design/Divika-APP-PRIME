import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createHash, randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { memoryStorage } from 'multer';
import { join } from 'path';

// Dónde se guardan las fotos que suben los usuarios:
//  - Con CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME) → en Cloudinary. Úsalo en la nube (Render
//    borra el disco del servidor en cada reinicio).
//  - Sin ella → en la carpeta backend/uploads (solo para desarrollo local).
export const CARPETA_LOCAL = join(process.cwd(), 'uploads');
export const MAX_BYTES = 5 * 1024 * 1024; // máx 5 MB (diagrama: business_photos.size_bytes)

const EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png' };

// Interceptor para rutas que reciben multipart/form-data con el campo "foto"
export const subidaFoto = () =>
  FileInterceptor('foto', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_BYTES },
    fileFilter: (_req, file, cb) => (EXT[file.mimetype] ? cb(null, true) : cb(new BadRequestException('Solo se aceptan fotos JPG o PNG'), false)),
  });

export const exigirFoto = (foto?: Express.Multer.File) => {
  if (!foto) throw new BadRequestException('Selecciona una foto (JPG o PNG, máx. 5 MB)');
  return foto;
};

function cloudinary() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) return null;
  const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url);
  if (!m) throw new Error('CLOUDINARY_URL debe ser cloudinary://API_KEY:API_SECRET@CLOUD_NAME');
  return { key: m[1], secret: m[2], nube: m[3] };
}

// Firma de Cloudinary: sha1 de los parámetros ordenados + el secreto
const firmar = (params: Record<string, string>, secreto: string) =>
  createHash('sha1').update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&') + secreto).digest('hex');

// Guarda la foto y devuelve su URL pública
export async function guardarFoto(foto: Express.Multer.File, carpeta = 'divika'): Promise<string> {
  const c = cloudinary();
  if (c) {
    const params = { folder: carpeta, timestamp: String(Math.floor(Date.now() / 1000)) };
    const form = new FormData();
    form.append('file', `data:${foto.mimetype};base64,${foto.buffer.toString('base64')}`);
    form.append('api_key', c.key);
    for (const [k, v] of Object.entries(params)) form.append(k, v);
    form.append('signature', firmar(params, c.secret));
    const r = await fetch(`https://api.cloudinary.com/v1_1/${c.nube}/image/upload`, { method: 'POST', body: form });
    const j = (await r.json()) as { secure_url?: string; error?: { message: string } };
    if (!r.ok || !j.secure_url) throw new BadRequestException(`No se pudo subir la foto: ${j.error?.message ?? r.status}`);
    return j.secure_url;
  }
  mkdirSync(CARPETA_LOCAL, { recursive: true });
  const nombre = `${randomUUID()}${EXT[foto.mimetype]}`;
  await writeFile(join(CARPETA_LOCAL, nombre), foto.buffer);
  const base = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
  return `${base}/uploads/${nombre}`;
}

// Borra una foto que subimos nosotros (las de ejemplo u otras URLs se ignoran). Nunca lanza error.
export async function borrarFoto(url: string | null | undefined) {
  if (!url) return;
  try {
    const c = cloudinary();
    if (c && url.includes(`res.cloudinary.com/${c.nube}/`)) {
      // .../image/upload/v123/divika/abc.jpg → public_id "divika/abc"
      const publicId = url.split('/upload/')[1]?.replace(/^v\d+\//, '').replace(/\.[a-z0-9]+$/i, '');
      if (!publicId) return;
      const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
      const form = new FormData();
      form.append('api_key', c.key);
      for (const [k, v] of Object.entries(params)) form.append(k, v);
      form.append('signature', firmar(params, c.secret));
      await fetch(`https://api.cloudinary.com/v1_1/${c.nube}/image/destroy`, { method: 'POST', body: form });
      return;
    }
    const archivo = url.split('/uploads/')[1];
    if (archivo && !archivo.includes('/') && !archivo.includes('..')) await unlink(join(CARPETA_LOCAL, archivo));
  } catch {
    /* la foto ya no existe o no se pudo borrar: no es crítico */
  }
}

// Las fotos de los negocios de ejemplo se guardan como "/ejemplos/archivo.jpg": se completan con la URL pública del backend
export function urlPublica(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('/') ? `${process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`}${url}` : url;
}

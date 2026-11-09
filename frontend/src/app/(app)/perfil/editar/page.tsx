'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/perfil/Avatar';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { guardarPendiente } from '@/lib/codigo';
import { soloDigitos } from '@/lib/codigo';
import { formatoTelefono } from '@/lib/formato';
import { useCuenta } from '@/lib/useCuenta';
import type { Cuenta } from '@/types';

export default function EditarPerfilPage() {
  const router = useRouter();
  const { cuenta, setCuenta, error: errorCarga } = useCuenta();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nacimiento, setNacimiento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);
  const archivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cuenta) return;
    setNombre([cuenta.nombre, cuenta.apellidos].filter(Boolean).join(' '));
    setEmail(cuenta.email);
    setTelefono(cuenta.telefono ? formatoTelefono(cuenta.telefono) : '');
    setNacimiento(cuenta.fechaNacimiento ?? '');
    setCiudad(cuenta.ciudad ?? '');
  }, [cuenta]);

  async function subirFoto(f?: File) {
    if (!f) return;
    setError('');
    setOk('');
    const datos = new FormData();
    datos.append('foto', f);
    try {
      setCuenta(await api<Cuenta>('/cuenta/foto', { method: 'POST', body: datos }));
      setOk('Foto actualizada');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto');
    }
  }

  async function quitarFoto() {
    setError('');
    try {
      setCuenta(await api<Cuenta>('/cuenta/foto', { method: 'DELETE' }));
      setOk('Foto eliminada');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo quitar la foto');
    }
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!cuenta) return;
    setError('');
    setOk('');
    setGuardando(true);
    try {
      const actualizada = await api<Cuenta>('/cuenta', {
        method: 'PUT',
        body: { nombre, email, fechaNacimiento: nacimiento || undefined, ciudad },
      });
      setCuenta(actualizada);

      // Si cambió el teléfono, se confirma con un código antes de guardarlo
      const nuevo = soloDigitos(telefono);
      const actual = soloDigitos(cuenta.telefono ?? '');
      if (nuevo && nuevo !== actual) {
        const { segundosEspera } = await api<{ segundosEspera: number }>('/cuenta/telefono/codigo', {
          method: 'POST',
          body: { telefono: nuevo },
        });
        guardarPendiente({ canal: 'sms', destino: nuevo, proximoEnvio: Date.now() + segundosEspera * 1000 });
        return router.push('/perfil/editar/codigo');
      }
      setOk('Cambios guardados');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <CabeceraPerfil titulo="Editar perfil" />
      {(error || errorCarga) && <Aviso onClose={() => setError('')}>{error || errorCarga}</Aviso>}
      {ok && <p className="pantalla-nota" role="status">{ok}</p>}

      {cuenta && (
        <form className="formulario" onSubmit={guardar}>
          <Avatar nombre={cuenta.nombre} url={cuenta.avatarUrl} editarHref={undefined} />
          <input ref={archivo} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => subirFoto(e.target.files?.[0])} />
          <button type="button" className="cambiar-foto" onClick={() => archivo.current?.click()}>
            Cambiar foto
          </button>
          {cuenta.avatarUrl && (
            <button type="button" className="cambiar-foto" onClick={quitarFoto}>Quitar foto</button>
          )}

          <label className="campo-etiqueta">Nombre completo
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" required />
          </label>
          <label className="campo-etiqueta">Correo electrónico
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
          <label className="campo-etiqueta">Teléfono
            <input type="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="618 123 4567" />
          </label>
          <p className="campo-ayuda">
            {cuenta.telefono && cuenta.telefonoVerificado ? 'Teléfono verificado. ' : ''}
            Si lo cambias, te enviaremos un código para confirmarlo.
          </p>
          <label className="campo-etiqueta">Fecha de nacimiento
            <input type="date" value={nacimiento} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setNacimiento(e.target.value)} />
          </label>
          <label className="campo-etiqueta">Ciudad
            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} autoComplete="address-level2" />
          </label>

          <Button className="btn--block" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</Button>
        </form>
      )}
    </>
  );
}

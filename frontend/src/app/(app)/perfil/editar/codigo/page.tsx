'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CodigoInput } from '@/components/forms/CodigoInput';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { CodigoPendiente, borrarPendiente, guardarPendiente, leerPendiente } from '@/lib/codigo';
import { formatoTelefono } from '@/lib/formato';
import { useCuenta } from '@/lib/useCuenta';
import type { Cuenta } from '@/types';

const reloj = (seg: number) => `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;

export default function CodigoTelefonoPage() {
  const router = useRouter();
  const { setCuenta } = useCuenta();
  const [pendiente, setPendiente] = useState<CodigoPendiente | null>(null);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const p = leerPendiente();
    if (!p) return router.replace('/perfil/editar');
    setPendiente(p);
  }, [router]);

  useEffect(() => {
    if (!pendiente) return;
    const tick = () => setSegundos(Math.max(0, Math.ceil((pendiente.proximoEnvio - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pendiente]);

  if (!pendiente) return null;

  async function confirmar() {
    if (!pendiente) return;
    setError('');
    setCargando(true);
    try {
      setCuenta(await api<Cuenta>('/cuenta/telefono/verificar', { method: 'POST', body: { telefono: pendiente.destino, codigo } }));
      borrarPendiente();
      router.push('/perfil/editar');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal');
      setCodigo('');
    } finally {
      setCargando(false);
    }
  }

  async function reenviar() {
    if (!pendiente) return;
    setError('');
    try {
      const { segundosEspera } = await api<{ segundosEspera: number }>('/cuenta/telefono/codigo', { method: 'POST', body: { telefono: pendiente.destino } });
      const nuevo = { ...pendiente, proximoEnvio: Date.now() + segundosEspera * 1000 };
      guardarPendiente(nuevo);
      setPendiente(nuevo);
      setCodigo('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal');
    }
  }

  return (
    <>
      <CabeceraPerfil titulo="Verifica tu teléfono" atras="/perfil/editar" />
      <p className="subtitulo">
        Ingresa el código que enviamos a <strong>{formatoTelefono(pendiente.destino)}</strong>
      </p>
      <CodigoInput value={codigo} onChange={(v) => { setCodigo(v); setError(''); }} error={!!error} />
      <Button className="btn--block" onClick={confirmar} disabled={codigo.length < 4 || cargando}>
        <IconCheck /> {cargando ? 'Verificando…' : 'Confirmar código'}
      </Button>
      {error && <p className="form__error texto-centrado" role="alert">{error}</p>}
      {segundos > 0 ? (
        <p className="texto-aparte">Podrás solicitar otro en <span className="rojo">{reloj(segundos)}</span></p>
      ) : (
        <p className="texto-aparte">
          ¿No recibiste el código?{' '}
          <button type="button" className="enlace-boton enlace-boton--rojo" onClick={reenviar}>Reenviar código</button>
        </p>
      )}
    </>
  );
}

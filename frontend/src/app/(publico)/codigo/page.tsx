'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CodigoInput } from '@/components/forms/CodigoInput';
import { Atras } from '@/components/layout/Atras';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';
import { entrar } from '@/lib/auth';
import { CodigoPendiente, borrarPendiente, leerPendiente, pedirCodigo } from '@/lib/codigo';

const formatoTelefono = (t: string) => t.replace(/\D/g, '').slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
const reloj = (seg: number) => `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;

export default function CodigoPage() {
  const router = useRouter();
  const [pendiente, setPendiente] = useState<CodigoPendiente | null>(null);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const p = leerPendiente();
    if (!p) return router.replace('/acceso');
    setPendiente(p);
  }, [router]);

  // Cuenta regresiva para poder pedir otro código
  useEffect(() => {
    if (!pendiente) return;
    const tick = () => setSegundos(Math.max(0, Math.ceil((pendiente.proximoEnvio - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pendiente]);

  if (!pendiente) return null;
  const esSms = pendiente.canal === 'sms';

  async function confirmar() {
    if (!pendiente) return;
    setError('');
    setCargando(true);
    try {
      await entrar('/auth/codigo/verificar', { canal: pendiente.canal, destino: pendiente.destino, codigo });
      borrarPendiente();
      router.push('/verificado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal');
      setCodigo('');
    } finally {
      setCargando(false);
    }
  }

  async function reenviar() {
    if (!pendiente) return;
    setError('');
    try {
      setPendiente(await pedirCodigo(pendiente.canal, pendiente.destino));
      setCodigo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal');
    }
  }

  return (
    <main className="screen screen--pagina">
      <Atras href="/acceso" />

      <div className="pagina">
        <h1 className="titulo">Ingresa el código que te enviamos</h1>
        <p className="subtitulo">
          {esSms ? 'A tu número celular: ' : 'A tu correo electrónico: '}
          <strong>{esSms ? formatoTelefono(pendiente.destino) : pendiente.destino}</strong>
        </p>

        <CodigoInput
          value={codigo}
          onChange={(v) => {
            setCodigo(v);
            setError('');
          }}
          error={!!error}
        />

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
      </div>
    </main>
  );
}

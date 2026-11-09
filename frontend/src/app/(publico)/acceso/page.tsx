'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Atras } from '@/components/layout/Atras';
import { Aviso } from '@/components/ui/Aviso';
import { Button } from '@/components/ui/Button';
import { IconChat, IconMail } from '@/components/ui/icons';
import { Canal, pedirCodigo, soloDigitos } from '@/lib/codigo';

export default function AccesoPage() {
  const router = useRouter();
  const [canal, setCanal] = useState<Canal>('sms');
  const [destino, setDestino] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const esSms = canal === 'sms';

  function cambiarCanal() {
    setCanal(esSms ? 'email' : 'sms');
    setDestino('');
    setError('');
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (esSms && soloDigitos(destino).length < 10) {
      return setError('Teléfono inválido. Verifica que el número sea correcto');
    }
    setCargando(true);
    try {
      await pedirCodigo(canal, destino.trim());
      router.push('/codigo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="screen screen--pagina">
      <Atras href="/" />
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}

      <form className="pagina" onSubmit={enviar} noValidate>
        <h1 className="titulo">{esSms ? 'Ingresa tu número celular' : 'Ingresa tu correo electrónico'}</h1>
        <p className="subtitulo">
          {esSms ? 'Te enviaremos un código para verificarlo' : 'Te enviaremos un código por correo'}
        </p>

        {esSms ? (
          <div className="telefono">
            <span className="telefono__lada">MX +52</span>
            <input
              className="telefono__input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Número de teléfono"
              aria-label="Número de teléfono"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <label className="icon-field">
            <span className="icon-field__icono"><IconMail /></span>
            <input
              className="icon-field__input"
              type="email"
              autoComplete="email"
              placeholder="Ingresa tu correo electrónico"
              aria-label="Correo electrónico"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              autoFocus
            />
          </label>
        )}

        <Button type="submit" variant={esSms ? 'sms' : 'primary'} className="btn--block" disabled={cargando || !destino.trim()}>
          {esSms ? <IconChat /> : <IconMail />}
          {cargando ? 'Enviando…' : esSms ? 'Recibir código por SMS' : 'Recibir código por correo'}
        </Button>

        <button type="button" className="enlace-boton" onClick={cambiarCanal}>
          {esSms ? 'Ingresar correo electrónico' : 'Ingresar número telefónico'}
        </button>
      </form>

      <p className="texto-aparte pie">
        <Link href="/login">Entrar con contraseña</Link>
        {' · '}
        <Link href="/login/proveedores">Soy proveedor</Link>
      </p>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { Button } from '@/components/ui/Button';
import { IconCheck } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { getUsuario } from '@/lib/auth';
import { cx } from '@/lib/cx';

const TIPOS = [
  ['aplicacion', 'Problema con la aplicación', 'Algo no funciona como esperabas'],
  ['reserva', 'Problema con una reservación', 'Fechas, horarios o confirmaciones'],
  ['pagos', 'Problema con pagos', 'Cobros o métodos de pago'],
  ['cancelaciones', 'Cancelaciones', 'Cancelar o reprogramar'],
  ['servicio', 'Problema con un servicio', 'Atención del negocio'],
  ['otro', 'Otro', 'Cualquier otro tema'],
] as const;

export default function ReportarPage() {
  const [tipo, setTipo] = useState<string>('');
  const [paso, setPaso] = useState(1);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const email = typeof window !== 'undefined' ? getUsuario()?.email : '';

  async function enviar() {
    setError('');
    setEnviando(true);
    try {
      await api('/soporte/reportes', { method: 'POST', body: { tipo, descripcion: texto } });
      setListo(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar el reporte');
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <>
        <CabeceraPerfil titulo="Reportar un problema" />
        <div className="eliminar">
          <span className="eliminar__sello" style={{ background: 'var(--color-categorias)', color: 'var(--color-primario)' }}><IconCheck /></span>
          <h2>Recibimos tu reporte</h2>
          <p>Gracias por avisarnos. Te responderemos a {email}.</p>
        </div>
        <Button className="btn--block" onClick={() => history.back()}>Listo</Button>
      </>
    );
  }

  return (
    <>
      <CabeceraPerfil titulo="Reportar un problema" atras={paso === 2 ? '/perfil/reportar' : '/perfil'} />
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}

      {paso === 1 ? (
        <>
          <p className="subtitulo">¿Qué tipo de problema tienes?</p>
          <div className="opciones-radio" role="radiogroup">
            {TIPOS.map(([id, titulo, detalle]) => (
              <button key={id} type="button" role="radio" aria-checked={tipo === id} className={cx('opcion-radio', tipo === id && 'opcion-radio--activa')} onClick={() => setTipo(id)}>
                <span><strong>{titulo}</strong><small>{detalle}</small></span>
                <span className="opcion-radio__punto" />
              </button>
            ))}
          </div>
          <Button className="btn--block" disabled={!tipo} onClick={() => setPaso(2)}>Continuar</Button>
        </>
      ) : (
        <>
          <label className="campo-etiqueta">Cuéntanos qué pasó
            <textarea value={texto} maxLength={1000} onChange={(e) => setTexto(e.target.value)} placeholder="Describe el problema con el mayor detalle posible" />
            <small>{texto.length}/1000</small>
          </label>
          <button type="button" className="ajuste" disabled style={{ opacity: 0.5 }}>
            <span className="ajuste__texto"><strong>Adjuntar imagen</strong><small>Próximamente</small></span>
          </button>
          <p className="nota-gris">Te responderemos a {email}. No incluyas contraseñas ni datos bancarios.</p>
          <Button className="btn--block" disabled={texto.trim().length < 5 || enviando} onClick={enviar}>{enviando ? 'Enviando…' : 'Enviar reporte'}</Button>
        </>
      )}
    </>
  );
}

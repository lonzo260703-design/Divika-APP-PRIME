'use client';

import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { Interruptor } from '@/components/ui/Interruptor';
import { usePreferencias } from '@/lib/useCuenta';
import type { Preferencias } from '@/types';

const canales: [keyof Preferencias['notificaciones'], string, string][] = [
  ['push', 'Notificaciones push', 'Avisos en tu dispositivo'],
  ['correo', 'Correo electrónico', 'Resúmenes y confirmaciones'],
  ['sms', 'SMS', 'Mensajes de texto'],
];
const tipos: [keyof Preferencias['notificaciones'], string, string][] = [
  ['recordatorios', 'Recordatorios de citas', 'Antes de tu reservación'],
  ['promociones', 'Promociones', 'Ofertas de negocios cercanos'],
  ['novedades', 'Novedades de Divika', 'Nuevas funciones y mejoras'],
];

export function Notificaciones({ cabecera = true, atras = '/perfil' }: { cabecera?: boolean; atras?: string }) {
  const { prefs, cambiar, error, setError } = usePreferencias();
  const fila = ([clave, titulo, detalle]: [keyof Preferencias['notificaciones'], string, string]) => (
    <div className="ajuste" key={clave}>
      <span className="ajuste__texto"><strong>{titulo}</strong><small>{detalle}</small></span>
      <Interruptor activo={!!prefs?.notificaciones[clave]} etiqueta={titulo} deshabilitado={!prefs} onChange={(v) => cambiar('notificaciones', clave, v)} />
    </div>
  );
  return (
    <>
      {cabecera && <CabeceraPerfil titulo="Notificaciones" atras={atras} />}
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      <h2 className="seccion-titulo">Canales</h2>
      <div className="grupo">{canales.map(fila)}</div>
      <h2 className="seccion-titulo">Tipos de aviso</h2>
      <div className="grupo">{tipos.map(fila)}</div>
      <p className="nota-gris">Tus preferencias se guardan en tu cuenta. El envío real de avisos por SMS, correo y push se activará cuando esos servicios estén conectados.</p>
    </>
  );
}

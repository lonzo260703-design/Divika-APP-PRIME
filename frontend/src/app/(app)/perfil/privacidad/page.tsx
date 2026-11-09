'use client';

import { useState } from 'react';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { Interruptor } from '@/components/ui/Interruptor';
import { IconDoc, IconDownload, IconHistory } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { usePreferencias } from '@/lib/useCuenta';

export default function PrivacidadPage() {
  const { prefs, cambiar, error, setError } = usePreferencias();
  const [info, setInfo] = useState('');

  async function descargar() {
    setError('');
    try {
      const datos = await api<unknown>('/cuenta/datos');
      const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mis-datos-divika.json';
      a.click();
      URL.revokeObjectURL(url);
      setInfo('Descargamos tus datos en un archivo.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron descargar tus datos');
    }
  }

  const sw = (grupo: 'privacidad', clave: 'mostrarFoto' | 'compartirUbicacion' | 'personalizar', titulo: string, detalle: string) => (
    <div className="ajuste">
      <span className="ajuste__texto"><strong>{titulo}</strong><small>{detalle}</small></span>
      <Interruptor activo={!!prefs?.[grupo][clave]} etiqueta={titulo} deshabilitado={!prefs} onChange={(v) => cambiar(grupo, clave, v)} />
    </div>
  );

  return (
    <>
      <CabeceraPerfil titulo="Privacidad" />
      {error && <Aviso onClose={() => setError('')}>{error}</Aviso>}
      {info && <Aviso onClose={() => setInfo('')}>{info}</Aviso>}

      <h2 className="seccion-titulo">Qué compartes</h2>
      <div className="grupo">
        {sw('privacidad', 'mostrarFoto', 'Mostrar mi foto', 'Visible para los negocios donde reserves')}
        {sw('privacidad', 'compartirUbicacion', 'Compartir ubicación', 'Para ver negocios cercanos')}
        {sw('privacidad', 'personalizar', 'Personalizar recomendaciones', 'Usar mi actividad para sugerirte negocios')}
      </div>

      <h2 className="seccion-titulo">Tus datos</h2>
      <div className="grupo">
        <button type="button" className="ajuste" onClick={descargar}>
          <span className="ajuste__icono"><IconDownload /></span>
          <span className="ajuste__texto"><strong>Descargar mis datos</strong><small>Archivo con la información de tu cuenta</small></span>
        </button>
        <button type="button" className="ajuste" onClick={() => setInfo('Divika no guarda historial de búsquedas, así que no hay nada que borrar.')}>
          <span className="ajuste__icono"><IconHistory /></span>
          <span className="ajuste__texto"><strong>Borrar historial</strong><small>Búsquedas y visitas recientes</small></span>
        </button>
        <button type="button" className="ajuste" onClick={() => setInfo('La política de privacidad estará disponible pronto.')}>
          <span className="ajuste__icono"><IconDoc /></span>
          <span className="ajuste__texto"><strong>Política de privacidad</strong><small>Próximamente</small></span>
        </button>
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { Button } from '@/components/ui/Button';
import { IconCard } from '@/components/ui/icons';

export default function PagosPage() {
  const [aviso, setAviso] = useState('');
  return (
    <>
      <CabeceraPerfil titulo="Formas de pago" />
      {aviso && <Aviso onClose={() => setAviso('')}>{aviso}</Aviso>}
      <p className="nota-gris">Vista de demostración: Divika no guarda datos reales de tarjeta. Las tarjetas de abajo son de ejemplo.</p>

      <h2 className="seccion-titulo">Mis tarjetas (ejemplo)</h2>
      <div className="tarjeta-pago">
        <div className="tarjeta-pago__cab"><span>VISA</span><span className="etiqueta-chica">Principal</span></div>
        <div className="tarjeta-pago__fila"><IconCard /><span>···· 4242<small>Vence 12/28</small></span></div>
      </div>
      <div className="tarjeta-pago">
        <div className="tarjeta-pago__cab"><span>Mastercard</span></div>
        <div className="tarjeta-pago__fila"><IconCard /><span>···· 9018<small>Vence 03/27</small></span></div>
      </div>

      <Button variant="secondary" className="btn--block" onClick={() => setAviso('Agregar formas de pago estará disponible pronto')}>Agregar forma de pago</Button>

      <h2 className="seccion-titulo">Métodos disponibles</h2>
      <div className="grupo">
        <div className="ajuste"><span className="ajuste__texto"><strong>Tarjeta de crédito o débito</strong></span></div>
        <div className="ajuste"><span className="ajuste__texto"><strong>Pago en el negocio</strong></span></div>
      </div>
    </>
  );
}

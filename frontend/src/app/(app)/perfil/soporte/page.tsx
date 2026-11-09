'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CabeceraPerfil } from '@/components/perfil/Cabecera';
import { Aviso } from '@/components/ui/Aviso';
import { IconChevron, IconFlag } from '@/components/ui/icons';

const PREGUNTAS = [
  { p: '¿Cómo cambio una reservación?', r: 'Ve a Calendario, selecciona tu reserva y elige la opción para cambiar la fecha o la hora.' },
  { p: '¿Cómo pido un reembolso?', r: 'Divika no procesa pagos: el cobro se acuerda directamente con el negocio, así que cualquier reembolso se pide a él.' },
  { p: 'No puedo acceder a mi cuenta', r: 'Entra con tu teléfono o correo y pide un código de 4 dígitos en la pantalla de acceso; no necesitas tu contraseña.' },
  { p: '¿Cómo cambio mi número de teléfono?', r: 'En Perfil › Editar perfil escribe el nuevo número; te enviaremos un código para confirmarlo.' },
  { p: '¿Cómo elimino mi cuenta?', r: 'En Perfil › Eliminar cuenta. Es permanente y no se puede deshacer.' },
];

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function SoportePage() {
  const [q, setQ] = useState('');
  const [abierta, setAbierta] = useState<number | null>(null);
  const [aviso, setAviso] = useState('');
  const lista = PREGUNTAS.filter((x) => norm(x.p + x.r).includes(norm(q)));

  return (
    <>
      <CabeceraPerfil titulo="Soporte y ayuda" />
      {aviso && <Aviso onClose={() => setAviso('')}>{aviso}</Aviso>}
      <label className="campo-etiqueta">
        <input type="search" placeholder="¿En qué podemos ayudarte?" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar en la ayuda" />
      </label>

      <h2 className="seccion-titulo">Preguntas frecuentes</h2>
      <div className="grupo faq">
        {lista.length === 0 && <p className="pantalla-nota" style={{ padding: '12px 0' }}>No encontramos resultados.</p>}
        {lista.map((x, i) => (
          <div key={x.p} className={abierta === i ? 'faq--abierta' : undefined}>
            <button type="button" className="faq__pregunta" aria-expanded={abierta === i} onClick={() => setAbierta(abierta === i ? null : i)}>
              {x.p}
              <span className="faq__flecha"><IconChevron /></span>
            </button>
            {abierta === i && <p className="faq__respuesta">{x.r}</p>}
          </div>
        ))}
      </div>

      <div className="grupo">
        <button type="button" className="ajuste" onClick={() => setAviso('El centro de ayuda estará disponible pronto')}>
          <span className="ajuste__texto"><strong>Centro de ayuda</strong><small>Próximamente</small></span>
        </button>
        <button type="button" className="ajuste" onClick={() => setAviso('El contacto con soporte estará disponible pronto')}>
          <span className="ajuste__texto"><strong>Contactar con soporte</strong><small>Próximamente</small></span>
        </button>
        <Link href="/perfil/reportar" className="ajuste">
          <span className="ajuste__icono"><IconFlag /></span>
          <span className="ajuste__texto"><strong>Reportar un problema</strong></span>
        </Link>
      </div>
      <p className="pantalla-nota texto-centrado">Atención de lunes a domingo · 9:00 a 21:00</p>
    </>
  );
}

'use client';

import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { IconEye, IconEyeOff } from './icons';

// Campo gris con icono a la izquierda (como en el diseño). Si es de contraseña, trae el ojo para mostrarla.
export function IconField({
  icon,
  label,
  type = 'text',
  ...props
}: { icon: ReactNode; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const esPassword = type === 'password';

  return (
    <label className="icon-field">
      <span className="icon-field__icono">{icon}</span>
      <input
        className="icon-field__input"
        aria-label={label}
        placeholder={label}
        type={esPassword && visible ? 'text' : type}
        {...props}
      />
      {esPassword && (
        <button
          type="button"
          className="icon-field__ojo"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      )}
    </label>
  );
}

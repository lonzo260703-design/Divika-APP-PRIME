'use client';

import { ClipboardEvent, KeyboardEvent, useEffect, useRef } from 'react';

const LARGO = 4;

// Cuatro casillas redondas. Avanza solo al escribir, retrocede con borrar y acepta pegar el código completo.
export function CodigoInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (valor: string) => void;
  error?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function escribir(i: number, texto: string) {
    const digitos = texto.replace(/\D/g, '');
    if (!digitos) return;
    const nuevo = (value.slice(0, i) + digitos).slice(0, LARGO);
    onChange(nuevo);
    refs.current[Math.min(nuevo.length, LARGO - 1)]?.focus();
  }

  function teclas(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[i]) onChange(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < LARGO - 1) refs.current[i + 1]?.focus();
  }

  function pegar(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LARGO);
    onChange(pegado);
    refs.current[Math.min(pegado.length, LARGO - 1)]?.focus();
  }

  return (
    <div className="codigo" role="group" aria-label="Código de 4 dígitos">
      {Array.from({ length: LARGO }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={error ? 'codigo__casilla codigo__casilla--error' : 'codigo__casilla'}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={LARGO}
          aria-label={`Dígito ${i + 1}`}
          value={value[i] ?? ''}
          onChange={(e) => escribir(i, e.target.value)}
          onKeyDown={(e) => teclas(i, e)}
          onPaste={pegar}
          onFocus={(e) => e.currentTarget.select()}
        />
      ))}
    </div>
  );
}

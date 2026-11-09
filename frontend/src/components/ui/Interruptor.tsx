// Interruptor de encendido/apagado (switch)
export function Interruptor({ activo, onChange, etiqueta, deshabilitado }: { activo: boolean; onChange?: (v: boolean) => void; etiqueta: string; deshabilitado?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={deshabilitado}
      className={`interruptor${activo ? ' interruptor--on' : ''}`}
      onClick={() => onChange?.(!activo)}
    >
      <span />
    </button>
  );
}

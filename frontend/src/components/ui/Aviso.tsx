import { IconAlert, IconClose } from './icons';

// Banner oscuro de error (como "Teléfono inválido…" en el diseño)
export function Aviso({ children, onClose }: { children: string; onClose?: () => void }) {
  return (
    <div className="aviso" role="alert">
      <span className="aviso__icono"><IconAlert /></span>
      <span className="aviso__texto">{children}</span>
      {onClose && (
        <button type="button" className="aviso__cerrar" aria-label="Cerrar aviso" onClick={onClose}>
          <IconClose />
        </button>
      )}
    </div>
  );
}

import type { ReactNode, SVGProps } from 'react';

// Iconos simples de trazo; heredan el color del texto (currentColor)
function Icono({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconBack = () => <Icono><path d="m15 5-7 7 7 7" /></Icono>;
export const IconClose = () => <Icono width="16" height="16"><path d="M6 6l12 12M18 6 6 18" /></Icono>;
export const IconCheck = () => <Icono><path d="m5 12 5 5 9-10" /></Icono>;
export const IconUser = () => <Icono><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Icono>;
export const IconPhone = () => <Icono><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Icono>;
export const IconMail = () => <Icono><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icono>;
export const IconLock = () => <Icono><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icono>;
export const IconEye = () => <Icono><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icono>;
export const IconEyeOff = () => <Icono><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.6 8.4 2 12 2 12s4 7 10 7c1.5 0 2.8-.4 4-1" /></Icono>;
export const IconChat = () => <Icono><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 21 12z" /></Icono>;
export const IconAlert = () => <Icono><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></Icono>;

export const IconApple = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

// "G" simple: cuadro blanco con la letra azul (el logo oficial de Google tiene reglas de uso propias)
export const IconGoogle = () => <span className="icono-g" aria-hidden>G</span>;

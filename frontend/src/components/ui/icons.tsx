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

// Navegación y perfil
export const IconHome = () => <Icono width="22" height="22"><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10M10 20v-6h4v6" /></Icono>;
export const IconCalendar = () => <Icono width="22" height="22"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></Icono>;
export const IconHeart = () => <Icono width="22" height="22"><path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" /></Icono>;
export const IconSearch = () => <Icono><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icono>;
export const IconPin = () => <Icono width="14" height="14"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></Icono>;
export const IconShield = () => <Icono><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" /><path d="m9 12 2 2 4-4" /></Icono>;
export const IconBell = () => <Icono><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2z" /><path d="M10 21h4" /></Icono>;
export const IconCard = () => <Icono><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></Icono>;
export const IconHelp = () => <Icono><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.5" /></Icono>;
export const IconFlag = () => <Icono><path d="M5 21V4M5 4h12l-2 4 2 4H5" /></Icono>;
export const IconUsers = () => <Icono><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.5.6 4 2.5 4 5" /></Icono>;
export const IconLogout = () => <Icono><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" /></Icono>;
export const IconTrash = () => <Icono><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Icono>;
export const IconChevron = () => <Icono width="16" height="16"><path d="m9 5 7 7-7 7" /></Icono>;
export const IconSort = () => <Icono width="14" height="14"><path d="M7 4v16M7 4 4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3" /></Icono>;
export const IconClock = () => <Icono width="16" height="16"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icono>;
export const IconStar = () => <Icono width="16" height="16" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></Icono>;

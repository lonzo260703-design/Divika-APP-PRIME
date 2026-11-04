import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/inter';
import '@/styles/tokens.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Divika',
  description: 'Encuentra, conecta y descubre',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Marco tipo teléfono (como en la plantilla). En pantallas chicas ocupa todo. */}
        <div className="frame">{children}</div>
      </body>
    </html>
  );
}

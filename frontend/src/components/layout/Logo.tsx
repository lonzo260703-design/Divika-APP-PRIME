// Logo real del diseño: frontend/public/logo.png
export function Logo({ pequeno = false }: { pequeno?: boolean }) {
  return <img src="/logo.png" alt="Divika, encuentra, conecta y descubre" className={pequeno ? 'logo logo--pequeno' : 'logo'} />;
}

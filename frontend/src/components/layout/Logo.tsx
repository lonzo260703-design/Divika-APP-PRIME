// Logo provisional hecho con texto. Cuando tengas el logo en imagen (SVG o PNG),
// ponlo en frontend/public/logo.svg y cambia el contenido por <img src="/logo.svg" alt="Divika" />
export function Logo({ pequeno = false }: { pequeno?: boolean }) {
  return (
    <div className={pequeno ? 'logo logo--pequeno' : 'logo'}>
      <div className="logo__pines" aria-hidden>
        <svg viewBox="0 0 16 22" width="16" height="22"><path fill="currentColor" d="M8 0a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8zm0 11.2A3.2 3.2 0 1 1 8 4.8a3.2 3.2 0 0 1 0 6.4z" /></svg>
        <svg viewBox="0 0 16 22" width="16" height="22"><path fill="currentColor" d="M8 0a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8zm0 11.2A3.2 3.2 0 1 1 8 4.8a3.2 3.2 0 0 1 0 6.4z" /></svg>
      </div>
      <div className="logo__marca">Divika</div>
      <p className="logo__lema">Encuentra, conecta y descubre</p>
    </div>
  );
}

import { Atras } from '../layout/Atras';

// Barra de título de las subpantallas del perfil
export function CabeceraPerfil({ titulo, atras = '/perfil' }: { titulo: string; atras?: string }) {
  return (
    <div className="cabecera">
      <Atras href={atras} />
      <h1 className="titulo">{titulo}</h1>
    </div>
  );
}

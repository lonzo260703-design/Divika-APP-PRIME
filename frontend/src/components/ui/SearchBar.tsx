import { IconSearch } from './icons';

type Props = { value: string; onChange: (valor: string) => void; placeholder?: string };

export function SearchBar({ value, onChange, placeholder = '¿Qué necesitas hoy?' }: Props) {
  return (
    <label className="search">
      <span className="search__icono"><IconSearch /></span>
      <input
        className="search__input"
        type="search"
        aria-label="Buscar"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

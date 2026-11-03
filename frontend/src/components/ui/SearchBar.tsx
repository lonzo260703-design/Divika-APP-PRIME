type Props = { value: string; onChange: (valor: string) => void; placeholder?: string };

export function SearchBar({ value, onChange, placeholder = '¿Qué necesitas hoy?' }: Props) {
  return (
    <div className="search">
      <span aria-hidden>🔍</span>
      <input
        className="search__input"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

export function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="field__input" {...props} />
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select className="field__input" {...props}>
        {children}
      </select>
    </label>
  );
}

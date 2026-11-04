// Muestra 6181234567 como 618 123 4567
export function formatoTelefono(tel: string) {
  return tel.replace(/\D/g, '').slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

// Número listo para wa.me (México: antepone 52 si son 10 dígitos)
export function numeroWhatsapp(tel: string) {
  const d = tel.replace(/\D/g, '');
  return d.length === 10 ? `52${d}` : d;
}

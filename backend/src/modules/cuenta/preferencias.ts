// Preferencias de la cuenta del cliente (pantallas Notificaciones y Privacidad)
export type Preferencias = {
  notificaciones: { push: boolean; correo: boolean; sms: boolean; recordatorios: boolean; promociones: boolean; novedades: boolean };
  privacidad: { mostrarFoto: boolean; compartirUbicacion: boolean; personalizar: boolean };
};

export const PREFERENCIAS_INICIALES: Preferencias = {
  notificaciones: { push: true, correo: true, sms: false, recordatorios: true, promociones: false, novedades: true },
  privacidad: { mostrarFoto: true, compartirUbicacion: true, personalizar: false },
};

// Mezcla lo guardado con los valores iniciales, para que una preferencia nueva nunca salga vacía
export function conIniciales(guardadas: unknown): Preferencias {
  const g = (guardadas ?? {}) as Partial<Preferencias>;
  return {
    notificaciones: { ...PREFERENCIAS_INICIALES.notificaciones, ...g.notificaciones },
    privacidad: { ...PREFERENCIAS_INICIALES.privacidad, ...g.privacidad },
  };
}

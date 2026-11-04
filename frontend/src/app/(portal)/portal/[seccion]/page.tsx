import { notFound } from 'next/navigation';

const SECCIONES: Record<string, { titulo: string; texto: string }> = {
  servicios: { titulo: 'Mis servicios', texto: 'Aquí podrás crear y editar los servicios que ofreces, con precio, duración y fotos.' },
  cobertura: { titulo: 'Ubicación y cobertura', texto: 'Aquí indicarás dónde atiendes y hasta qué zona llegas.' },
  pagos: { titulo: 'Formas de pago', texto: 'Aquí indicarás cómo pueden pagarte tus clientes. Divika no procesa pagos ni cobra comisión.' },
  calendario: { titulo: 'Calendario y disponibilidad', texto: 'Aquí organizarás tu jornada y los horarios en que aceptas citas.' },
  solicitudes: { titulo: 'Solicitudes y citas', texto: 'Aquí revisarás las solicitudes de tus clientes antes de confirmar un servicio.' },
  mensajes: { titulo: 'Mensajes', texto: 'Aquí conversarás con tus clientes sobre sus solicitudes.' },
  notificaciones: { titulo: 'Notificaciones', texto: 'Aquí verás lo importante de tu negocio en un solo lugar.' },
  resenas: { titulo: 'Reseñas y ajustes', texto: 'Aquí responderás las reseñas y administrarás tu cuenta.' },
};

export default async function Seccion({ params }: { params: Promise<{ seccion: string }> }) {
  const { seccion } = await params;
  const s = SECCIONES[seccion];
  if (!s) notFound();
  return (
    <>
      <h1 className="p-titulo">{s.titulo}</h1>
      <section className="p-tarjeta p-aviso-grande">
        <h2>Próximamente</h2>
        <p>{s.texto}</p>
        <p>Esta pantalla estará disponible muy pronto.</p>
      </section>
    </>
  );
}

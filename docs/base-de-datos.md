# Base de datos

TypeORM crea las tablas solas (`synchronize: true`, solo para desarrollo). La fuente de verdad son los `*.entity.ts` en `backend/src/modules/`.

```mermaid
erDiagram
  usuarios ||--o{ negocios : "es dueño (owner)"
  usuarios ||--o{ resenas : escribe
  negocios ||--o{ resenas : recibe
  usuarios ||--o{ favoritos : marca
  usuarios ||--o{ reportes_problema : envia
  negocios ||--o{ favoritos : "es marcado"

  usuarios {
    int id PK
    string nombre
    string apellidos "solo proveedores"
    string email UK
    string passwordHash "nulo si entra con Google/Apple"
    string rol "cliente | negocio"
    string telefono UK
    bool telefonoVerificado
    string telefonoPendiente "numero por confirmar con codigo"
    string fechaNacimiento "AAAA-MM-DD"
    string ciudad
    string avatarUrl
    json preferencias "notificaciones y privacidad"
    string codigoOtp
    date otpExpiraEn
    string googleId UK
    string appleId UK
    date creadoEn
  }
  reportes_problema {
    int id PK
    string tipo "aplicacion | reserva | pagos | cancelaciones | servicio | otro"
    string descripcion "max 1000"
    int usuarioId FK
    date creadoEn
  }
  negocios {
    int id PK
    string nombre
    string rfc UK
    string descripcionCorta "para las cards"
    string descripcion "perfil, max 600 caracteres"
    string categoria
    string subcategoria "opcional, debe pertenecer a la categoria"
    string telefono
    string direccion
    string ciudad
    string colonia
    string whatsapp
    string emailPublico
    string estado "en_proceso | publicado | pausado; solo publicado sale en el directorio"
    float latitud
    float longitud
    json horariosJson
    string horario
    float calificacion "promedio de resenas"
    string imagenUrl
    json galeria
    int clicsWhatsapp
    int clicsLlamada
    int ownerId FK
    date creadoEn
  }
  resenas {
    int id PK
    int calificacion "1 a 5"
    text comentario
    int usuarioId FK
    int negocioId FK
    date creadoEn
  }
  interesados {
    int id PK
    string nombreNegocio
    string servicio
    string telefono
    string ciudad
    date creadoEn
  }
  favoritos {
    int id PK
    int usuarioId FK
    int negocioId FK "unico junto con usuarioId"
    date creadoEn
  }
```

`interesados` guarda los contactos del formulario "Únete gratis" de la landing (sin cuenta, sin relaciones).

Las tablas del portal del proveedor que faltan (servicios, solicitudes y citas, mensajes, notificaciones, disponibilidad, formas de pago) están descritas por sus datos en [`api-portal-proveedor.md`](api-portal-proveedor.md).

Al borrar un usuario o negocio se borran en cascada sus reseñas y favoritos; si se borra el dueño de un negocio, `ownerId` queda nulo.

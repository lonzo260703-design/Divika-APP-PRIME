# Base de datos

TypeORM crea las tablas solas (`synchronize: true`, solo para desarrollo). La fuente de verdad son los `*.entity.ts` en `backend/src/modules/`.

```mermaid
erDiagram
  usuarios ||--o{ negocios : "es dueño (owner)"
  usuarios ||--o{ resenas : escribe
  negocios ||--o{ resenas : recibe
  usuarios ||--o{ favoritos : marca
  negocios ||--o{ favoritos : "es marcado"

  usuarios {
    int id PK
    string nombre
    string email UK
    string passwordHash "nulo si entra con Google/Apple"
    string rol "cliente | negocio"
    string telefono UK
    bool telefonoVerificado
    string codigoOtp
    date otpExpiraEn
    string googleId UK
    string appleId UK
    date creadoEn
  }
  negocios {
    int id PK
    string nombre
    string rfc UK
    string descripcionCorta
    string categoria
    string subcategoria "opcional, debe pertenecer a la categoria"
    string telefono
    string direccion
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
  favoritos {
    int id PK
    int usuarioId FK
    int negocioId FK "unico junto con usuarioId"
    date creadoEn
  }
```

Al borrar un usuario o negocio se borran en cascada sus reseñas y favoritos; si se borra el dueño de un negocio, `ownerId` queda nulo.

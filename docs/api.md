# API

Base: `http://localhost:3001`. Rutas con 🔒 requieren `Authorization: Bearer <token>`.

## Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro/cliente` | `{ nombre, email, telefono (10 dígitos), password }`. No verifica el teléfono: eso se hace con el código |
| POST | `/auth/registro/proveedor` | Alta desde el sitio web: `{ nombre, apellidos, email, password, negocio: { nombre, categoria, telefono, ciudad, colonia }, aceptaTerminos: true, recibirNovedades? }`. Crea usuario y negocio en estado `en_proceso` (no sale en el directorio hasta publicar). Devuelve `{ token, usuario }` |
| POST | `/auth/registro/negocio` | Crea usuario y negocio en una transacción (`categoria` y `subcategoria` opcional) |
| POST | `/auth/login` | Correo y contraseña. Devuelve `{ token, usuario }` |
| POST | `/auth/codigo/enviar` | `{ canal: 'sms' \| 'email', destino }`. Genera un código de 4 dígitos. Responde igual exista o no la cuenta. Un envío por minuto (429 si se repite antes) |
| POST | `/auth/codigo/verificar` | `{ canal, destino, codigo }`. Si es correcto devuelve `{ token, usuario }` (y marca el teléfono como verificado en `sms`). Vigencia 10 min, máximo 5 intentos |
| GET 🔒 | `/auth/me` | Perfil del usuario |
| POST 🔒 | `/auth/otp/enviar`, `/auth/otp/verificar` | Verificar un teléfono con la sesión ya iniciada (mismas reglas del código) |
| POST | `/auth/google`, `/auth/apple` | **Desactivados** (501) hasta validar el token con la librería oficial de cada proveedor |

**Códigos:** solo se guarda su hash. Todavía no hay proveedor de SMS ni de correo: el código se imprime en la consola del backend (`[CÓDIGO SIMULADO] ...`). Para producción, conectar Twilio (SMS) o un servicio de correo en `AuthService.emitirCodigo`.

## Categorías
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categorias` | Las 12 categorías con sus subcategorías: `[{ slug, nombre, subcategorias: [...] }]`. Es la fuente única; el frontend la lee de aquí |

Se editan en `backend/src/modules/negocios/categorias.ts`. El icono de cada una va en `frontend/src/components/home/categoriaIconos.tsx`, por `slug`.

## Negocios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/negocios` | Filtros opcionales: `buscar` (nombre), `categoria`, `subcategoria`. Con `lat` y `lng` cada negocio trae `distanciaKm`; con `orden=distancia` (y ubicación) se ordena por cercanía, si no por calificación |
| GET | `/negocios/top` | Top 10 |
| GET | `/negocios/cercanos?lat=&lng=&radio=` | Ordenados por distancia (km, radio por defecto 10) |
| GET 🔒 | `/negocios/propietario/mis-negocios` | Negocios del usuario |
| GET | `/negocios/:id` | Detalle (dueño: solo id y nombre) |
| POST | `/negocios/:id/clic-whatsapp`, `/clic-llamada` | Suman a las métricas |
| POST 🔒 | `/negocios` | Crear. `subcategoria` es opcional y debe pertenecer a la categoría |
| PUT 🔒 | `/negocios/:id`, `/negocios/:id/fotos` | Solo el dueño |
| DELETE 🔒 | `/negocios/:id` | Solo el dueño |

## Reseñas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/resenas/negocio/:negocioId` | Reseñas del negocio, más recientes primero |
| POST 🔒 | `/resenas` | `{ negocioId, calificacion (1-5), comentario? }`; recalcula el promedio del negocio |

## Mi negocio (proveedor) 🔒
Para usuarios con `rol = 'negocio'`; siempre operan sobre su propio negocio.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/proveedor/negocio` | Su negocio, con `estado` (`en_proceso`, `publicado`, `pausado`) |
| PUT | `/proveedor/negocio` | `{ nombre?, categoria?, subcategoria?, descripcion? (máx. 600), telefono?, whatsapp?, emailPublico?, ciudad?, colonia?, metodosPago? (efectivo\|transferencia\|tarjeta, solo informativo), cobertura? { radioKm 1-100, zonas[] máx. 15 } }` |
| POST | `/proveedor/negocio/publicar` | Pasa a `publicado`. 422 si falta nombre, descripción, teléfono o al menos una foto |
| POST | `/proveedor/negocio/pausar` | De `publicado` a `pausado` |
| POST | `/proveedor/negocio/fotos` | `multipart/form-data`, campo `foto` (JPG o PNG, máx. 10 MB, hasta 10). Devuelve el negocio |
| PUT | `/proveedor/negocio/fotos/orden` | `{ orden: [2, 0, 1] }`: índices de la galería en el orden nuevo. La primera es la portada |
| DELETE | `/proveedor/negocio/fotos/:indice` | Quita la foto en esa posición |

Solo los negocios `publicado` salen en `/negocios`, `/negocios/top` y `/negocios/cercanos`. Las fotos subidas se guardan en `backend/uploads/` y se sirven en `/uploads/...`; la variable `PUBLIC_URL` arma el enlace completo.

## Proveedores (sitio web)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/proveedores/interesados` | Formulario "Únete gratis" de la landing, sin sesión: `{ nombreNegocio, servicio, telefono, ciudad }`. Responde `{ ok: true }` |

## Cuenta del cliente 🔒
Pantallas de Perfil (editar, seguridad, notificaciones, privacidad, reportar problema, eliminar cuenta). Todas requieren sesión.

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/cuenta` | Perfil completo: `id, nombre, apellidos, email, rol, telefono, telefonoVerificado, fechaNacimiento (AAAA-MM-DD), ciudad, avatarUrl, tienePassword, preferencias` |
| PUT 🔒 | `/cuenta` | `{ nombre?, email?, fechaNacimiento?, ciudad? }`. Devuelve el perfil. El correo se cambia sin código de verificación (pendiente de correo real) |
| POST 🔒 | `/cuenta/foto` | `multipart/form-data`, campo `foto` (JPG/PNG, máx. 10 MB). Devuelve el perfil con `avatarUrl` absoluta |
| DELETE 🔒 | `/cuenta/foto` | Quita la foto |
| POST 🔒 | `/cuenta/contrasena` | `{ actual, nueva }`; nueva: mínimo 8 caracteres, una mayúscula y un número |
| POST 🔒 | `/cuenta/telefono/codigo` | `{ telefono }` (10 dígitos). Envía código de 4 dígitos (simulado en consola). Responde `{ enviado, segundosEspera: 60 }` |
| POST 🔒 | `/cuenta/telefono/verificar` | `{ telefono, codigo }`. Si coincide, guarda el teléfono como verificado y devuelve el perfil |
| GET / PUT 🔒 | `/cuenta/preferencias` | `{ notificaciones: { push, correo, sms, recordatorios, promociones, novedades }, privacidad: { mostrarFoto, compartirUbicacion, personalizar } }`. PUT acepta parcial |
| GET 🔒 | `/cuenta/datos` | Exportación JSON de los datos del usuario (cuenta, reseñas, favoritos) |
| DELETE 🔒 | `/cuenta` | Elimina la cuenta y sus datos. 403 si es proveedor (rol `negocio`) |
| POST 🔒 | `/soporte/reportes` | `{ tipo: aplicacion\|reserva\|pagos\|cancelaciones\|servicio\|otro, descripcion (máx. 1000) }` |

Sin backend todavía (el front las muestra como "próximamente" o demo): verificación en dos pasos, dispositivos conectados, adjuntar imagen en reportes, formas de pago (demo, sin datos reales de tarjeta).

## Servicios, citas y mensajes
Estados de una cita: `solicitada → confirmada | rechazada`, `solicitada → propuesta → confirmada` (el cliente acepta), y `cancelada` (cliente o negocio). Un horario solo se bloquea cuando hay una cita **confirmada**. Las fechas son `AAAA-MM-DD` y las horas `HH:MM`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/negocios/:id/servicios` | Servicios activos del negocio: `{ id, nombre, descripcion, precio (nulo = a consultar), duracionMin, activo, categoria, modalidad (local\|domicilio\|ambos), costoTraslado, indicaciones, fotoUrl }` |
| GET | `/negocios/:id/disponibilidad?fecha=AAAA-MM-DD&servicioId=` | Oferta calculada por el servidor: `{ fecha, abierto, motivo?, duracionMin, horas: [{ hora, libre }], ocupadas: ["10:00"] }`. Aplica horario semanal, bloqueos, anticipación mínima, días máximos y traslape con citas confirmadas (según duración del servicio). 404 si el negocio no está publicado |
| POST 🔒 | `/citas` | Cliente: `{ negocioId, servicioId?, fecha, hora, personas, notas?, metodoPago? }`. 400 si la hora está fuera de la oferta (cerrado, bloqueado, anticipación); 409 si el horario está ocupado o ya pidió ese horario |
| GET 🔒 | `/citas/mias` | Citas del cliente |
| POST 🔒 | `/citas/:id/aceptar-propuesta` | El cliente acepta el horario que propuso el negocio |
| POST 🔒 | `/citas/:id/cancelar` | Cancela el cliente dueño de la cita o el dueño del negocio |
| GET / POST 🔒 | `/mensajes`, `/mensajes/negocio/:negocioId` | Cliente: conversaciones; hilo (marca leídos); envío `{ texto }` (POST) |
| GET / POST / PUT / DELETE 🔒 | `/proveedor/servicios[/:id]` | CRUD de servicios del negocio `{ nombre, descripcion?, precio?, duracionMin, activo?, categoria?, modalidad? (por defecto local), costoTraslado?, indicaciones? }`. 400 si `modalidad` ≠ local y el negocio no tiene `atiendeDomicilio`. Con modalidad local el traslado se ignora |
| POST / DELETE 🔒 | `/proveedor/servicios/:id/foto` | POST multipart con el campo `foto` (JPG/PNG, máx. 10 MB); DELETE la quita. Devuelve el servicio |
| GET 🔒 | `/proveedor/citas` | Citas del negocio |
| POST 🔒 | `/proveedor/citas/:id/confirmar`, `/rechazar` | Solo si está `solicitada` |
| POST 🔒 | `/proveedor/citas/:id/proponer` | `{ fecha, hora }` → estado `propuesta` |
| GET / POST 🔒 | `/proveedor/mensajes`, `/proveedor/mensajes/:clienteId` | Conversaciones, hilo y respuesta. Solo se responde a clientes que escribieron o pidieron cita |
| GET / PUT 🔒 | `/proveedor/disponibilidad` | `{ horarios: { domingo…sabado: { apertura, cierre, cerrado } }, reglas: { duracionBase, intervaloMin (15/30/60), anticipacionHoras, maxDias }, bloqueos: [{ desde, hasta, motivo? }] }`. PUT acepta cualquier parte; 400 si cierre ≤ apertura, intervalo inválido o bloqueo con `hasta` < `desde`. Zona horaria: variable `TZ_NEGOCIOS` (por defecto America/Mexico_City) |
| GET 🔒 | `/proveedor/resenas` | Reseñas del negocio |
| POST 🔒 | `/proveedor/resenas/:id/respuesta` | `{ texto }` (máx. 500). Aparece como `respuesta` en `GET /resenas/negocio/:id` |

## Ubicación, pagos y visitas del negocio 🔒
`PUT /proveedor/negocio` acepta además: `calle`, `colonia`, `ciudad` (la `direccion` pública se arma con calle, colonia y ciudad), `referencias`, `latitud`, `longitud`, `atiendeDomicilio` (al apagarlo, los servicios a domicilio pasan a `local`), `instruccionesPago` (máx. 500), `mostrarPagoPerfil`. `GET/PUT /proveedor/negocio` devuelven `instruccionesPago` solo al dueño; `GET /negocios/:id` la incluye únicamente si `mostrarPagoPerfil` es verdadero y los listados nunca la incluyen.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/negocios/:id/visita` | Suma una visita al perfil (el front lo llama al abrir el detalle). 404 si no está publicado |
| GET 🔒 | `/proveedor/negocio/estadisticas` | `{ serie: [{ fecha, total }] (14 días), visitas7, visitasPrevias7 }` |

## Notificaciones 🔒 (cualquier rol)
Avisos dentro de la app. Se crean al: llegar/confirmar/rechazar/proponer/aceptar/cancelar una cita, recibir un mensaje (en ambos sentidos), recibir una reseña y al responder el negocio una reseña.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/notificaciones` | `{ noLeidas, items: [{ id, tipo: cita\|mensaje\|resena, titulo, detalle, enlace, leida, creadoEn }] }` (más recientes primero) |
| POST | `/notificaciones/:id/leer` | Marca una como leída (404 si no es del usuario) |
| POST | `/notificaciones/leer-todas` | Marca todas |

Todavía no se envía SMS/correo/push; el portal consulta `/notificaciones` cada 30 s y los chats cada 8 s.

## Favoritos
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/favoritos` | Negocios favoritos del usuario |
| POST 🔒 | `/favoritos/:negocioId` | Agrega (idempotente) |
| DELETE 🔒 | `/favoritos/:negocioId` | Quita |

---

# Contrato con el frontend

Esta sección es para quien implemente el backend en otra tecnología (por ejemplo PostgreSQL). El frontend solo depende de esto; los tipos exactos están en `frontend/src/types/index.ts`.

## Reglas generales
- JSON en todo. Errores: HTTP 4xx con `{ "message": "texto" }` o `{ "message": ["texto1", "texto2"] }`. El frontend muestra ese `message` tal cual al usuario, así que debe venir en español.
- Autenticación: `Authorization: Bearer <JWT>`. El token se guarda en el navegador.
- CORS: debe permitir el origen del frontend (hoy `FRONTEND_URL`).
- Fechas en ISO 8601. Calificaciones: número de 0 a 5.

## Rutas que el frontend usa hoy
| Pantalla | Ruta | Respuesta esperada |
|---|---|---|
| Registro | `POST /auth/registro/cliente`, `POST /auth/registro/negocio` | `{ token, usuario }` |
| Login | `POST /auth/login` | `{ token, usuario }` |
| Acceso por código | `POST /auth/codigo/enviar` | `{ enviado: boolean, segundosEspera: number }` |
| Acceso por código | `POST /auth/codigo/verificar` | `{ token, usuario }` |
| Inicio, categorías | `GET /categorias` | `[{ slug, nombre, subcategorias: string[] }]` |
| Inicio, listado | `GET /negocios?buscar=&categoria=&subcategoria=&orden=&lat=&lng=` | `Negocio[]` (con `distanciaKm` si hay `lat` y `lng`) |
| Inicio (Top 10) | `GET /negocios/top` | `Negocio[]` |
| Detalle | `GET /negocios/:id` | `Negocio` + `owner: { id, nombre } \| null` |
| Detalle | `GET /resenas/negocio/:id` | `[{ id, calificacion, comentario, creadoEn, usuario: { id, nombre } }]` |
| Detalle | `POST /negocios/:id/clic-whatsapp`, `/clic-llamada` | Cualquier 2xx |

## Formas de los datos
**usuario:** `{ id, nombre, email, rol: 'cliente' | 'negocio', telefono?, telefonoVerificado? }`. Nunca debe incluir el hash de la contraseña ni el del código.

**Negocio:** `id, nombre, descripcionCorta, categoria` (slug), `subcategoria, telefono` (10 dígitos), `direccion, latitud, longitud, horario, horariosJson, calificacion, imagenUrl, galeria, metodosPago, cobertura, clicsWhatsapp, clicsLlamada, creadoEn`.
- `horariosJson` usa las claves `lunes, martes, miercoles, jueves, viernes, sabado, domingo` (sin acentos), cada una `{ apertura: "09:00", cierre: "19:00", cerrado: false }`. Es lo que pinta el horario del detalle.
- `latitud` y `longitud` deben ser reales: de ahí salen el mapa y la distancia.
- `imagenUrl` es una URL completa.

## Reglas de negocio que el frontend da por hechas
- **Código de acceso:** 4 dígitos, vigencia de 10 minutos, 5 intentos, un envío por minuto (429 si se repite antes). `enviar` responde igual exista o no la cuenta, para no revelar quién está registrado.
- **Teléfono de cliente:** obligatorio, 10 dígitos y único.
- **Categorías:** el frontend no las tiene fijas; las pide a `/categorias`. Los `slug` deben coincidir con los de los iconos (`frontend/src/components/home/categoriaIconos.tsx`).
- **Distancia:** en kilómetros, calculada desde `lat` y `lng` del usuario (fórmula haversine).
- **Orden por defecto:** por calificación descendente.

## Portal del proveedor y sitio web
Las rutas nuevas que pide el diseño web están en [`api-portal-proveedor.md`](api-portal-proveedor.md).

## Aún sin pantalla en el frontend
`/favoritos`, `/negocios/cercanos`, `/auth/me`, `PUT/DELETE /negocios`, `POST /resenas`. Existen en este backend por si se necesitan.

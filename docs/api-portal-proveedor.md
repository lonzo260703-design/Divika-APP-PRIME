# API pendiente: portal del proveedor y sitio web

Rutas y datos que necesitan las pantallas web del diseño y que **todavía no existen** en el backend. Complementa `docs/api.md`. Todas las rutas con 🔒 requieren `Authorization: Bearer <token>` de un usuario con `rol = 'negocio'` y solo operan sobre **su propio negocio**.

Convenciones: las mismas de `docs/api.md` (JSON, errores `{ message }` en español, fechas ISO 8601, montos en MXN como número).

## Ya implementado en el backend de referencia
`POST /auth/registro/proveedor`, `GET/PUT /proveedor/negocio`, `POST /proveedor/negocio/publicar` y `/pausar`, fotos del negocio (subir, reordenar, quitar) y `POST /proveedores/interesados`. Están documentadas en `docs/api.md`. Dos diferencias con lo propuesto abajo, para simplificar: las fotos se identifican por **posición** (índice) y no tienen etiqueta, y el correo de verificación de la cuenta no se envía todavía.

## Prioridad
| Prioridad | Qué | Por qué |
|---|---|---|
| **1** | Registro de proveedor, perfil del negocio y fotos, interesados | Es lo que se conecta primero; casi todo existe ya en parte |
| **2** | Servicios, formas de pago, ubicación y cobertura | El perfil público del negocio las muestra |
| **3** | Disponibilidad, solicitudes y citas | Núcleo del portal |
| **4** | Mensajes, notificaciones, reseñas (respuestas), ajustes, resumen | Dependen de lo anterior |

---

## 1. Cuenta y registro de proveedor
El diseño registra al proveedor en 4 pasos (Cuenta, Negocio, Servicios, Publicación). El alta queda **en proceso** hasta que él publica.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro/proveedor` | `{ nombre, apellidos, email, password, negocio: { nombre, categoria, subcategoria?, telefono, ciudad, colonia }, aceptaTerminos: true, recibirNovedades?: boolean }`. Crea usuario (`rol: 'negocio'`) y negocio con `estado: 'en_proceso'`. Devuelve `{ token, usuario }`. Envía correo con enlace para verificar la cuenta |
| POST | `/auth/verificar-correo` | `{ token }` del enlace del correo |
| POST | `/auth/google`, `/auth/github`, `/auth/facebook` | El login web muestra Google, GitHub y Facebook. Validar el token con la librería oficial de cada proveedor |
| GET 🔒 | `/auth/me` | Debe incluir `apellidos` y, para proveedores, `negocioId` y `estadoNegocio` |

Cambios en datos existentes:
- **Usuario:** agregar `apellidos`.
- **Negocio:** agregar `estado` (`en_proceso` \| `publicado` \| `pausado`), `ciudad`, `colonia`, `descripcion` (máx. 600 caracteres, distinta de `descripcionCorta`), `whatsapp`, `emailPublico`.
- El `registro/negocio` actual puede quedar como alias de `registro/proveedor` o retirarse.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/proveedores/interesados` | **Ya existe en este backend.** Formulario "Únete gratis" de la landing, **sin sesión**: `{ nombreNegocio, servicio, telefono, ciudad }`. Guarda el contacto para seguimiento comercial. Responde `{ ok: true }` |

## 2. Perfil del negocio
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/negocio` | Su negocio completo, con `estado` y fotos |
| PUT 🔒 | `/proveedor/negocio` | `{ nombre, categoria, subcategoria?, descripcion, telefono, whatsapp, emailPublico }`. "Los cambios se guardan cuando confirmas": el perfil publicado sigue visible hasta guardar |
| POST 🔒 | `/proveedor/negocio/fotos` | Subir una foto (JPG o PNG, máx. 10 MB, hasta 10 fotos). Devuelve la foto con su `id` y `url` |
| PUT 🔒 | `/proveedor/negocio/fotos/orden` | `{ ids: number[] }` para reordenar ("Arrastra para ordenar"). La primera es la portada |
| PUT 🔒 | `/proveedor/negocio/fotos/:id` | Cambiar la foto o su etiqueta ("Portada", "Nuestro salón"…) |
| DELETE 🔒 | `/proveedor/negocio/fotos/:id` | Quitar foto |
| POST 🔒 | `/proveedor/negocio/publicar` | Pasa a `publicado`. Falla (422) si falta algo obligatorio; el mensaje dice qué |
| POST 🔒 | `/proveedor/negocio/pausar` | "Ocultar perfil temporalmente". Las citas y conversaciones se conservan |
| GET | `/negocios/:id` | Ya existe. Debe devolver también `descripcion`, `servicios` publicados, `formasPago` y `cobertura` |

## 3. Servicios
**Servicio:** `{ id, nombre, categoria, descripcion, fotos[], precioTipo: 'fijo' | 'desde', precio, duracionMin, enSalon: boolean, aDomicilio: boolean, costoTraslado, radioKm, indicaciones, publicado }`

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/servicios` | Lista (pantalla "Mis servicios", sin diseño todavía) |
| POST 🔒 | `/proveedor/servicios` | Crear |
| GET 🔒 | `/proveedor/servicios/:id` | Detalle |
| PUT 🔒 | `/proveedor/servicios/:id` | Editar. Si es `'desde'`, el aviso "explica qué puede cambiar el precio" va en `descripcion` |
| POST 🔒 | `/proveedor/servicios/:id/fotos` | Hasta 6 fotos de resultado, JPG o PNG, máx. 10 MB |
| DELETE 🔒 | `/proveedor/servicios/:id/fotos/:fotoId` | Quitar foto |
| POST 🔒 | `/proveedor/servicios/:id/pausar`, `/publicar` | "Pausar servicio sin eliminarlo". Las citas confirmadas no cambian |
| DELETE 🔒 | `/proveedor/servicios/:id` | Eliminar |
| GET | `/negocios/:id/servicios` | Público: solo los publicados |

Regla: el total a domicilio es `precio + costoTraslado`, y el traslado solo aplica con modalidad `a_domicilio` dentro del `radioKm`.

## 4. Formas de pago
Solo informativas: Divika **no procesa pagos ni cobra comisión**.

**Formas de pago:** `{ efectivo: { enSalon, aDomicilio }, tarjetas: { enSalon, aDomicilio }, transferencia: { enSalon, aDomicilio }, instruccionesSalon, instruccionesDomicilio, mostrarEnPerfil }`
- Regla: `tarjetas.aDomicilio` siempre es `false` ("las tarjetas solo están disponibles en salón").

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/formas-pago` | |
| PUT 🔒 | `/proveedor/formas-pago` | Guarda todo |

Se muestran en el perfil público solo si `mostrarEnPerfil` es `true`.

## 5. Ubicación y cobertura
Está en el menú pero **no tiene diseño**. Propuesta mínima, a confirmar con diseño:

**Cobertura:** `{ direccion, latitud, longitud, ciudad, colonias: string[], radioKm }`

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒, PUT 🔒 | `/proveedor/cobertura` | Las coordenadas deben ser reales (mapa y distancia). Convertir dirección a coordenadas en el backend o con un servicio de mapas |

## 6. Calendario y disponibilidad
**Horario semanal:** por día (`lunes`…`domingo`), `{ cerrado: boolean, tramos: [{ inicio: "10:00", fin: "20:00" }] }`. Se permiten varios tramos por día ("+ Tramo") y un descanso (ej. 14:20 a 15:10).

**Reglas:** `{ duracionBaseMin: 60, intervaloEntreCitasMin: 15, anticipacionMinHoras: 12, ventanaDias: 30, aplicarASalonYDomicilio: boolean }`

**Bloqueo:** `{ id, desde, hasta, motivo }` ("Añadir bloqueo", "Motivo interno").

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/disponibilidad` | `{ horarioSemanal, descansos, reglas, bloqueos }` |
| PUT 🔒 | `/proveedor/disponibilidad/horario` | Los cambios no mueven citas confirmadas |
| PUT 🔒 | `/proveedor/disponibilidad/reglas` | |
| POST 🔒 | `/proveedor/disponibilidad/bloqueos` | |
| DELETE 🔒 | `/proveedor/disponibilidad/bloqueos/:id` | |
| GET 🔒 | `/proveedor/calendario?mes=2026-11` | Por día: `{ fecha, estado: 'disponible' \| 'con_citas' \| 'bloqueado' \| 'no_laborable', numCitas }`, para pintar el mes |
| GET 🔒 | `/proveedor/calendario/dia?fecha=2026-11-12` | Detalle: jornada, descanso, citas del día y huecos libres |
| GET | `/negocios/:id/huecos?servicioId=&fecha=` | Público, para que el cliente elija hora ("Ver fechas" en la app) |

## 7. Solicitudes y citas
**Solicitud o cita:** `{ id, folio, cliente: { id, nombre }, servicio: { id, nombre }, fecha, horaInicio, duracionMin, modalidad: 'salon' | 'domicilio', direccionCliente?, notaCliente, precio, traslado, total, estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada', creadaEn }`

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/solicitudes?estado=&buscar=&mes=` | Lista, con contadores `{ porResponder, confirmadasEsteMes, completadas }` |
| GET 🔒 | `/proveedor/solicitudes/:id` | Detalle (panel derecho) |
| POST 🔒 | `/proveedor/solicitudes/:id/aceptar` | Valida calendario, horario y conflictos |
| POST 🔒 | `/proveedor/solicitudes/:id/proponer-horario` | `{ fecha, horaInicio }` |
| POST 🔒 | `/proveedor/solicitudes/:id/rechazar` | `{ motivo? }` |
| POST 🔒 | `/proveedor/solicitudes/:id/completar`, `/cancelar` | |
| POST 🔒 | `/solicitudes` | **Cliente** (rol `cliente`): `{ negocioId, servicioId, fecha, horaInicio, modalidad, direccion?, nota? }` |
| GET 🔒 | `/solicitudes/mias` | **Cliente**: sus solicitudes (pantalla Reservaciones) |

## 8. Mensajes
Conversación entre cliente y proveedor, con el contexto de la solicitud.

**Conversación:** `{ id, cliente: { id, nombre }, solicitudId?, ultimoMensaje, noLeidos, actualizadaEn }` · **Mensaje:** `{ id, deParte: 'cliente' | 'proveedor', texto, enviadoEn, leidoEn? }`

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/conversaciones?filtro=todos\|no_leidos&buscar=` | |
| GET 🔒 | `/proveedor/conversaciones/:id/mensajes` | Marca como leídos |
| POST 🔒 | `/proveedor/conversaciones/:id/mensajes` | `{ texto }` |
| POST 🔒 | `/conversaciones` | **Cliente**: inicia o continúa conversación con un negocio ("Enviar mensaje" del detalle) |
| GET 🔒, POST 🔒 | `/conversaciones/...` | Equivalentes del lado del cliente |

Tiempo real (WebSocket o *polling* cada pocos segundos) queda a decisión del backend. El front funciona con *polling*.

## 9. Notificaciones
**Notificación:** `{ id, tipo: 'solicitud' | 'mensaje' | 'cita' | 'resena' | 'horario', titulo, detalle, enlace, leida, creadaEn }`. Las genera el backend al ocurrir un evento (nueva solicitud, mensaje, cita confirmada, reseña, cambio de horario).

| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/notificaciones?tipo=&noLeidas=true` | Con total de no leídas |
| POST 🔒 | `/proveedor/notificaciones/:id/leer` | |
| POST 🔒 | `/proveedor/notificaciones/leer-todas` | "Marcar todas como leídas" |
| GET, PUT 🔒 | `/proveedor/notificaciones/preferencias` | Por tipo: `{ solicitudesYCitas, mensajes, resenas, novedadesDivika }` y canales activos (portal, correo) |

## 10. Reseñas y ajustes
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/resenas?filtro=todas\|sin_responder\|respondidas` | Incluye `{ promedio, total, distribucion: { 5: n, 4: n, … } }` |
| POST 🔒 | `/proveedor/resenas/:id/respuesta` | `{ texto }`. Es pública en el perfil del negocio |
| PUT 🔒 | `/proveedor/resenas/:id/respuesta` | Editar la respuesta |
| GET /negocios/:id | | `GET /resenas/negocio/:id` debe agregar `respuesta: { texto, creadaEn } \| null` |
| GET, PUT 🔒 | `/proveedor/cuenta` | `{ nombreContacto, email, correoVerificado }` ("Guardar datos de cuenta") |
| POST 🔒 | `/proveedor/cuenta/contrasena` | `{ actual, nueva }` |
| GET, PUT 🔒 | `/proveedor/cuenta/resumen-correo` | Frecuencia del resumen: diario \| semanal \| nunca |
| PUT 🔒 | `/proveedor/cuenta/verificacion-dos-pasos` | Activar o desactivar |
| GET 🔒 | `/proveedor/cuenta/dispositivos` | Sesiones activas |
| DELETE 🔒 | `/proveedor/cuenta/dispositivos/:id` | Cerrar esa sesión |

## 11. Resumen (Inicio del proveedor)
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/proveedor/resumen` | Una sola llamada: `{ visitasPerfil: { total, variacionPct, serie[] }, solicitudesRecibidas: { total, variacion, serie[] }, citasConfirmadas: { total, proximasSemana, serie[] }, valoracion: { promedio, total }, solicitudesPendientes: [3 más recientes], proximasCitas: [2 próximas], configuracion: { pasosListos, pasosTotal, pendientes[] }, mensajesSinLeer: [último], noLeidos: { mensajes, notificaciones } }` |
| POST | `/negocios/:id/visita` | Suma una visita al perfil (alimenta las métricas). Sin sesión; evitar duplicados por visitante |

Los pasos de configuración son: perfil, fotos y servicios publicados, ubicación y horarios, formas de pago.

## Aún sin diseño (confirmar con diseño antes de construir)
- Mis servicios (lista) y Ubicación y cobertura.
- Detalle de negocio, listado por categoría y perfil del usuario en versión web.
- Pantalla de cliente para elegir fecha y solicitar cita.

## Notas para quien lo implemente
- Un proveedor solo ve y modifica **su** negocio, sus servicios, solicitudes, conversaciones y notificaciones (403 si no).
- Almacenamiento de fotos: decidir proveedor (disco, S3, Cloudinary…). Hoy `imagenUrl` guarda una URL completa.
- Las zonas horarias son de Ciudad de México; las fechas viajan en ISO y el front las muestra en hora local.

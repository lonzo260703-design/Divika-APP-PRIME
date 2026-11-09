# Resumen para el equipo de backend

El backend de `backend/` (NestJS + SQLite) es **solo de referencia**: sirve para que el front funcione mientras se construye el real. El front depende de las **rutas y la forma de las respuestas**, no de las tablas. Para usar el backend real basta cambiar `NEXT_PUBLIC_API_URL`.

Detalle de cada ruta: [`api.md`](api.md). Tipos exactos que lee el front: `frontend/src/types/index.ts`. Tablas de referencia (orientativas): [`base-de-datos.md`](base-de-datos.md).

## Convenciones
- JSON; errores 4xx con `{ "message": "texto en español" }` (o lista de textos). El front los muestra tal cual.
- `Authorization: Bearer <JWT>`; el rol del usuario es `cliente` o `negocio`. Fechas `AAAA-MM-DD`, horas `HH:MM` (24 h), montos en MXN como número, hora local del negocio (zona configurable).
- Archivos (fotos): `multipart/form-data`, campo `foto`, JPG/PNG, máx. 10 MB; las respuestas traen URL absoluta.
- CORS abierto al origen del front.

## Qué cubre cada área
| Área | Rutas principales |
|---|---|
| Acceso | `/auth/registro/cliente`, `/auth/registro/proveedor`, `/auth/login`, `/auth/codigo/enviar` y `/verificar` (4 dígitos, 10 min, 5 intentos, 1 envío por min), `/auth/me` |
| Directorio | `/categorias`, `/negocios` (filtros, distancia por `lat`/`lng`), `/negocios/top`, `/negocios/:id`, `/resenas/negocio/:id`, `POST /resenas`, `/favoritos` |
| Perfil del cliente | `/cuenta` (datos, foto, contraseña, teléfono con código, preferencias, exportar datos, eliminar), `/soporte/reportes` |
| Reservas (cliente) | `/negocios/:id/servicios`, `/negocios/:id/disponibilidad`, `POST /citas`, `/citas/mias`, `/citas/:id/aceptar-propuesta`, `/citas/:id/cancelar`, `/mensajes` |
| Portal del proveedor | `/proveedor/negocio` (perfil, ubicación, pagos, publicar/pausar, fotos, estadísticas), `/proveedor/servicios`, `/proveedor/citas`, `/proveedor/mensajes`, `/proveedor/resenas`, `/proveedor/disponibilidad` |
| Avisos | `/notificaciones` (listar, leer, leer todas) |

## Reglas que el front da por hechas
**Citas.** Estados: `solicitada → confirmada | rechazada`; `solicitada → propuesta → confirmada` (el cliente acepta); `cancelada` (cliente o negocio). Solo una cita **confirmada** bloquea horario. 409 si el horario ya está ocupado o el cliente ya pidió ese horario.

**Disponibilidad.** `GET /negocios/:id/disponibilidad?fecha=&servicioId=` devuelve `{ fecha, abierto, motivo?, duracionMin, horas: [{ hora, libre }], ocupadas }`. El servidor calcula las horas con: horario semanal (`horariosJson`, claves `domingo…sabado` sin acentos), bloqueos por fecha, reglas (`duracionBase`, `intervaloMin` 15/30/60, `anticipacionHoras`, `maxDias`) y traslape con citas confirmadas según la duración del servicio. `POST /citas` revalida: 400 si la hora no está en la oferta, 409 si está ocupada. El proveedor edita todo con `GET/PUT /proveedor/disponibilidad`.

**Servicios.** `{ nombre, descripcion, precio (nulo = a consultar), duracionMin, activo, categoria, modalidad: local|domicilio|ambos, costoTraslado, indicaciones, fotoUrl }`. Modalidad distinta de `local` exige que el negocio tenga `atiendeDomicilio`. Si el cliente elige domicilio, el front manda su dirección dentro de `notas` de la cita.

**Negocio.** Estados `en_proceso | publicado | pausado`; solo `publicado` sale en el directorio y admite citas. Publicar exige nombre, descripción, teléfono y una foto (422). Campos de ubicación: `calle, colonia, ciudad, referencias, latitud, longitud, atiendeDomicilio, cobertura { radioKm, zonas }`; `direccion` se arma con calle, colonia y ciudad.

**Pagos.** Divika **no procesa pagos**: `metodosPago` (efectivo, transferencia, tarjeta) e `instruccionesPago` son solo informativos. `instruccionesPago` es privada: la ve el dueño y el público únicamente si `mostrarPagoPerfil` es verdadero; nunca en listados.

**Visitas.** `POST /negocios/:id/visita` suma una visita; `GET /proveedor/negocio/estadisticas` devuelve `{ serie (14 días), visitas7, visitasPrevias7 }`.

**Avisos.** Se crean (para el usuario que corresponda) cuando: llega, se confirma, rechaza, propone, acepta o cancela una cita; llega un mensaje (en ambos sentidos); llega una reseña; el negocio responde una reseña. Forma: `{ noLeidas, items: [{ id, tipo: cita|mensaje|resena, titulo, detalle, enlace, leida, creadoEn }] }`. El front consulta cada 30 s (portal) y cada 8 s (chats).

**Reseñas.** El negocio puede responder una (`respuesta`, máx. 500), que sale en `GET /resenas/negocio/:id`. Recalcular el promedio del negocio al crear.

## Simulado o pendiente (decidir con ustedes)
- **SMS y correo:** hoy el código de acceso se imprime en consola; falta proveedor real (verificación de teléfono y correo, recuperar contraseña).
- **Push / SMS / correo de avisos:** solo existen avisos dentro de la app.
- **Inicio de sesión con Google/Apple:** desactivado (501) hasta validar el token del proveedor.
- **Fotos:** se guardan en disco local; en producción usar almacenamiento de objetos.
- **Pagos:** no hay cobro; cualquier pasarela sería una decisión de producto aparte.
- **Verificación de identidad, verificación en dos pasos y dispositivos conectados:** el front los muestra como "próximamente".
- **Visitas:** se guardan como json por día; en PostgreSQL conviene una tabla `visitas(negocioId, fecha, total)`.
- **Producción:** HTTPS, secretos (`JWT_SECRET`), CORS y zona horaria (`TZ_NEGOCIOS`).

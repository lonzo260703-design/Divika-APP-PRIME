# API

Base: `http://localhost:3001`. Rutas con 🔒 requieren `Authorization: Bearer <token>`.

## Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro/cliente` | Crea cuenta de cliente |
| POST | `/auth/registro/negocio` | Crea usuario y negocio en una transacción |
| POST | `/auth/login` | Devuelve `{ token, usuario }` |
| GET 🔒 | `/auth/me` | Perfil del usuario |
| POST | `/auth/google`, `/auth/apple` | **Simulados**: no validan el token, no usar en producción |
| POST 🔒 | `/auth/otp/enviar`, `/auth/otp/verificar` | Verificación de teléfono; el código solo se imprime en consola |

## Negocios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/negocios?buscar=&categoria=` | Lista filtrada, por calificación |
| GET | `/negocios/top` | Top 10 |
| GET | `/negocios/cercanos?lat=&lng=&radio=` | Ordenados por distancia (km, radio por defecto 10) |
| GET 🔒 | `/negocios/propietario/mis-negocios` | Negocios del usuario |
| GET | `/negocios/:id` | Detalle (dueño: solo id y nombre) |
| POST | `/negocios/:id/clic-whatsapp`, `/clic-llamada` | Suman a las métricas |
| POST 🔒 | `/negocios` | Crear |
| PUT 🔒 | `/negocios/:id`, `/negocios/:id/fotos` | Solo el dueño |
| DELETE 🔒 | `/negocios/:id` | Solo el dueño |

## Reseñas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/resenas/negocio/:negocioId` | Reseñas del negocio, más recientes primero |
| POST 🔒 | `/resenas` | `{ negocioId, calificacion (1-5), comentario? }`; recalcula el promedio del negocio |

## Favoritos
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/favoritos` | Negocios favoritos del usuario |
| POST 🔒 | `/favoritos/:negocioId` | Agrega (idempotente) |
| DELETE 🔒 | `/favoritos/:negocioId` | Quita |

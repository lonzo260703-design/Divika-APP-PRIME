# API

Base: `http://localhost:3001`. Rutas con 🔒 requieren `Authorization: Bearer <token>`.

## Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro/cliente` | `{ nombre, email, telefono (10 dígitos), password }`. No verifica el teléfono: eso se hace con el código |
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

## Favoritos
| Método | Ruta | Descripción |
|---|---|---|
| GET 🔒 | `/favoritos` | Negocios favoritos del usuario |
| POST 🔒 | `/favoritos/:negocioId` | Agrega (idempotente) |
| DELETE 🔒 | `/favoritos/:negocioId` | Quita |

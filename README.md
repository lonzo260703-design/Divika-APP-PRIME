# Divika

Directorio de negocios locales. Monorepo con backend NestJS y frontend Next.js.

```
divika/
├── backend/    NestJS + TypeORM + SQLite   → http://localhost:3001
├── frontend/   Next.js (App Router)        → http://localhost:3000
└── docs/       API y base de datos
```

## Cómo correrlo (Node 20 o más nuevo)

```bash
# Terminal 1
cd backend
cp .env.example .env      # y cambia JWT_SECRET
npm install
npm run start:dev

# Terminal 2
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Abre http://localhost:3000. La base (`backend/divika.sqlite`) se crea sola con 8 negocios de ejemplo.

**Códigos de verificación:** aún no se envían por SMS ni correo. Al pedir un código, búscalo en la terminal del backend (`[CÓDIGO SIMULADO] Código para ...: 1234`).

## Dónde cambiar cosas

| Quiero cambiar…                 | Archivo |
|---------------------------------|---------|
| Colores, bordes, sombra, fuente | `frontend/src/styles/tokens.css` |
| Cómo se ve una card             | `frontend/src/styles/globals.css` (sección Card) |
| Logo                            | `frontend/public/logo.png` |
| Foto del banner de inicio       | `frontend/public/banner-inicio.png` (opcional; sin ella solo se ve el texto) |
| Categorías                      | `frontend/src/lib/categorias.ts` **y** `backend/src/modules/negocios/categorias.ts` |
| Campos de registro              | `backend/src/modules/auth/dto.ts` + `frontend/src/components/forms/` |
| Tablas de la base               | `backend/src/modules/**/*.entity.ts` (ver `docs/base-de-datos.md`) |

## Cambiar de SQLite a PostgreSQL o MySQL
En `backend/src/app.module.ts` reemplaza el bloque `TypeOrmModule.forRoot` y instala el driver (`npm i pg` o `npm i mysql2`).

## Documentación
- [API](docs/api.md)
- [Base de datos](docs/base-de-datos.md)

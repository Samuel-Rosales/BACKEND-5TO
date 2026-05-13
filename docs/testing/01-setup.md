# 1) Requisitos y Setup

## 1.1 Requisitos
- Node.js + npm.
- PostgreSQL accesible por `DATABASE_URL`.

## 1.2 Variables de entorno
Crea un `.env` (o variables de entorno del sistema) con:
- `DATABASE_URL` (obligatoria)
- `API_PORT` (opcional, default `3000`)
- `API_URL` (opcional, default `http://localhost:${API_PORT}`)

Ejemplo:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clinic_db?schema=public"
API_PORT=3000
API_URL="http://localhost:3000"
```

## 1.3 Prisma y DB
Este proyecto usa Prisma con **Driver Adapter** (Postgres) a través de Pool.
- Config: `src/configs/prisma.config.ts`
- Prisma config: `prisma.config.ts`

Comandos útiles:
- `npm run build` (genera Prisma client + compila TS)
- `npm run prisma:seed` (seed recomendado para data demo y pre-requisitos de facturación)

Reset de DB (solo entorno de desarrollo):
```bash
npm run db:reset
```

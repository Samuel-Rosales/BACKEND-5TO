AGENTS (Backend)

Muy conciso — sólo lo que un agente probablemente no adivinaría.

Entradas y comandos clave
- Desarrollo local:
  - cd BACKEND-5TO && npm run dev
    - Usa nodemon + ts-node (tsconfig-paths) para recarga rápida.
- Compilar / ejecutar en producción:
  - npm run build  -> npx prisma generate && tsc && tsc-alias
  - npm run start  -> npx prisma migrate deploy && node dist/app.js
    - Nota crítica: npm start ejecuta prisma migrate deploy. Asegúrate de que DATABASE_URL apunte al DB correcto antes de usarlo en entornos reales.

Prisma / base de datos
- Archivos y scripts:
  - Prisma CLI scripts están en package.json (prisma:generate, prisma:migrate, prisma:push, prisma:studio, prisma:seed, db:reset).
  - El seed es TypeScript: prisma.seed usa ts-node y la ruta prisma/seed.ts (revisa el campo "prisma.seed" en package.json).
- Requisitos previos:
  - BACKEND-5TO/.env debe contener DATABASE_URL y API_PORT (por defecto API_PORT=3800).
  - Muchas operaciones de Prisma (migrate, seed, studio) fallarán si DATABASE_URL no está definido o la BD no es accesible.

Peligros y guías rápidas
- No ejecutar prisma:seed ni migrate deploy contra una BD de producción a menos que estés seguro — ambos modifican datos/esquema.
- db:reset (prisma migrate reset) borra datos locales — úsalo sólo en entornos no productivos.

Docs y pruebas
- Guía de tests y listas de comprobación operativas: BACKEND-5TO/docs/testing/

Otros
- El repositorio raíz tiene scripts que invocan los scripts del backend desde el root (por ejemplo, npm run prisma:generate desde el root reenvía al workspace). Si trabajas aislado, usa los comandos dentro de BACKEND-5TO.

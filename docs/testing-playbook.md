# Playbook de Testing (Backend-5TO)

Esta guía fue dividida en módulos para que sea más fácil de leer y mantener.

## TL;DR (para mañana)
1. Configurar `.env` con `DATABASE_URL`.
2. Instalar deps: `npm i`.
3. Reset DB (solo dev): `npm run db:reset`.
4. Seed recomendado: `npm run prisma:seed`.
5. Levantar server: `npm run dev`.
6. Probar flujos clave:
   - Finalizar consulta ⇒ genera factura (estricto)
   - Pagos factura ⇒ IGTF en efectivo divisa
   - Crear compra ⇒ crea lotes + movimientos IN

## Documentación modular
Ver índice en: `docs/testing/README.md`


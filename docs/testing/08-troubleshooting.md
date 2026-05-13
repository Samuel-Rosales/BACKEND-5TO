# 8) Troubleshooting (fallos típicos)

- Error al finalizar consulta: normalmente falta `ExchangeRate` activa / `Tax` activo / `StatusInvoice`.
  - Solución: correr `npm run prisma:seed`.

- Errores de conexión DB:
  - Verificar `DATABASE_URL`.
  - Verificar que Postgres esté levantado.

- Validaciones 400/422:
  - IDs no existen (`supplierId`, `userId`, `productId`, `exchangeRateId`).
  - Fechas no ISO.

## 8.1 Gotchas conocidos (para no perder tiempo)

- **Roles por ID**: el validador de `Role` actualmente valida `id` desde `body` y no desde `param`, así que endpoints tipo `GET /auth/role/:id` pueden fallar por validación. Para el setup de testing normalmente basta con `POST /auth/role` y usar el `id` devuelto para crear usuarios.

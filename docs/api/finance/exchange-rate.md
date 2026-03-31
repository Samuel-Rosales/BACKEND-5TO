# Tasas de cambio

Base URL: `/api/v1/finance/exchange-rate`

## Modelo (Prisma: `ExchangeRate`)

- `id` (Int, autoincrement)
- `rate` (Decimal)
- `createdAt` (DateTime, default: `now()`)
- `is_active` (Boolean, default: `true`)

Relaciones:

- `ExchangeRate (1) -> (N) Invoice`
- `ExchangeRate (1) -> (N) InvoicePayment`
- `ExchangeRate (1) -> (N) InvoiceExpense`
- `ExchangeRate (1) -> (N) ExpensePayment`
- `ExchangeRate (1) -> (N) Purchase`

Notas:

- `rate` es `Decimal`: en respuestas normalmente llega como **string**.
- `is_active` suele representar la tasa vigente para cálculos automáticos.

## POST `/`

Qué hace:

- Crea una tasa de cambio.

Cómo usarlo (pasos):

1) Define `rate` (> 0).
2) Decide si debe quedar activa (`is_active=true`).
3) Envía el JSON.

Body:

- `rate` (number, **requerido**, > 0)
- `is_active?` (boolean) → por defecto se asume `true`.

Request (JSON):

```json
{
  "rate": 38.5,
  "is_active": true
}
```

Regla: si se crea/actualiza una tasa con `is_active: true`, el sistema desactiva las demás.

Response (201):

```json
{
  "message": "Tasa de cambio creada éxitosamente",
  "data": {
    "id": 1,
    "rate": "38.5",
    "createdAt": "2026-03-23T12:00:00.000Z",
    "is_active": true
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista tasas.
- `GET /:id`: obtiene una tasa.
- `PUT /:id`: actualiza `rate` y/o `is_active`.
- `DELETE /:id`: elimina una tasa (hard delete).

Recomendación:

- En vez de borrar tasas históricas, normalmente se conserva el historial y solo se alterna `is_active`.

Nota: si el `:id` no existe, el backend responde `400` (error de validación con `express-validator`).

PUT body: `rate?`, `is_active?`.

Ejemplo PUT request:

```json
{
  "rate": 39,
  "is_active": true
}
```

DELETE es hard delete.
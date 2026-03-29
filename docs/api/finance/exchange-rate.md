# Tasas de cambio

Base URL: `/api/v1/finance/exchange-rate`

## POST `/`

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
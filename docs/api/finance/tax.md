# Impuestos

Base URL: `/api/v1/finance/tax`

## POST `/`

Body:

- `name` (string, **requerido**, 2..120)
- `rate` (number, **requerido**, 0 < rate < 100)
- `code?` (string, 1..60)
- `isActive?` (boolean)

Request (JSON):

```json
{
  "name": "IVA",
  "rate": 16,
  "code": "IVA",
  "isActive": true
}
```

Response (201):

```json
{
  "message": "Impuesto creado éxitosamente",
  "data": {
    "id": 1,
    "name": "IVA",
    "rate": "16",
    "code": "IVA",
    "isActive": true
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Nota: si el `:id` no existe, el backend responde `400` (error de validación con `express-validator`).

DELETE es hard delete.
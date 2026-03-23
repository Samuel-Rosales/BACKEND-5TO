# Métodos de pago

Base URL: `/api/v1/finance/payment-method`

## POST `/`

Body:

- `name` (string, **requerido**, 2..120)
- `type` (string, **requerido**, 2..50)
- `currency` (string, **requerido**, 2..10)
- `is_active?` (boolean)

Request (JSON):

```json
{
  "name": "Efectivo USD",
  "type": "cash",
  "currency": "usd",
  "is_active": true
}
```

Response (201):

```json
{
  "message": "Método de pago creado éxitosamente",
  "data": {
    "id": 1,
    "name": "Efectivo USD",
    "type": "cash",
    "currency": "usd",
    "is_active": true
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
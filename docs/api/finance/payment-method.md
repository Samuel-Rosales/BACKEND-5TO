# Métodos de pago

Base URL: `/api/v1/finance/payment-method`

## Modelo (Prisma: `PaymentMethod`)

- `id` (Int, autoincrement)
- `name` (String)
- `type` (String)
- `currency` (String)
- `is_active` (Boolean, default: `true`)

Relaciones:

- `PaymentMethod (1) -> (N) InvoicePayment`
- `PaymentMethod (1) -> (N) ExpensePayment`
- `PaymentMethod (1) -> (N) PurchasePayment`

Notas:

- `currency` suele ser un código como `USD` o `VES`.
- `is_active` permite deshabilitar un método sin eliminar registros históricos.

## POST `/`

Qué hace:

- Crea un método de pago.

Cómo usarlo (pasos):

1) Define `name`.
2) Define `type` (ej. `cash`, `transfer`, `card`).
3) Define `currency` (ej. `USD`, `VES`).
4) (Opcional) Define `is_active`.
5) Envía el JSON.

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

Qué hacen:

- `GET /`: lista métodos.
- `GET /:id`: obtiene uno.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina (hard delete).

Recomendación:

- Para "retirar" un método de pago, suele bastar con `PUT /:id` y `is_active=false`.

Nota: si el `:id` no existe, el backend responde `400` (error de validación con `express-validator`).

DELETE es hard delete.
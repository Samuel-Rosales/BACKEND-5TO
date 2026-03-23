# Pagos de compra

Base URL: `/api/v1/procurement/purchase-payment`

## POST `/`

Body:

- `purchaseId` (int > 0, **requerido**, debe existir)
- `paymentMethodId` (int > 0, **requerido**, debe existir)
- `amount` (number, **requerido**, > 0)
- `currency?` (string, 1..10)
- `reference?` (string, 1..200)
- `payment_date?` (string ISO)

Request (JSON):

```json
{
  "purchaseId": 1,
  "paymentMethodId": 1,
  "amount": 50,
  "currency": "usd",
  "reference": "TRX-999",
  "payment_date": "2026-03-23T12:00:00.000Z"
}
```

Response (201) (ejemplo):

```json
{
  "message": "Pago de compra creado éxitosamente",
  "data": {
    "id": 1,
    "purchaseId": 1,
    "paymentMethodId": 1,
    "amount": "50",
    "currency": "usd",
    "reference": "TRX-999",
    "payment_date": "2026-03-23T12:00:00.000Z"
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
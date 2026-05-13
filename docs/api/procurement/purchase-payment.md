# Pagos de compra

Base URL: `/api/v1/procurement/purchase-payment`

## Modelo (Prisma: `PurchasePayment`)

- `id` (Int, autoincrement)
- `purchaseId` (Int, requerido) → FK a `Purchase.id`
- `paymentMethodId` (Int, requerido) → FK a `PaymentMethod.id`
- `amount` (Decimal)
- `currency` (String?)
- `reference` (String?)
- `payment_date` (DateTime?)

Relaciones:

- `PurchasePayment.purchaseId -> Purchase.id`
- `PurchasePayment.paymentMethodId -> PaymentMethod.id`

Notas:

- `amount` es `Decimal`: en respuestas normalmente llega como **string**.
- `currency` puede venir del método de pago (`PaymentMethod.currency`) si el backend lo resuelve automáticamente.

## POST `/`

Qué hace:

- Registra un pago asociado a una compra.

Cómo usarlo (pasos):

1) Verifica que exista `purchaseId`.
2) Verifica que exista `paymentMethodId`.
3) Define `amount` (> 0).
4) (Opcional) Envía `currency`, `reference` y/o `payment_date`.
5) Envía el JSON.

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
  "message": "Pago de compra registrado éxitosamente",
  "data": {
    "id": 1,
    "purchaseId": 1,
    "paymentMethodId": 1,
    "amount": "50",
    "currency": "usd",
    "reference": "TRX-999",
    "payment_date": "2026-03-23T12:00:00.000Z",
    "paymentMethod": { "id": 1, "name": "Transferencia", "type": "TRANSFER", "currency": "USD", "is_active": true },
    "purchase": { "id": 1, "supplierId": 1, "userId": 1, "status": "COMPLETED", "exchangeRateId": 1, "reference": "FAC-123", "date": "2026-03-23T12:00:00.000Z" }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista pagos.
- `GET /:id`: obtiene un pago.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina el pago (hard delete).

DELETE es hard delete.
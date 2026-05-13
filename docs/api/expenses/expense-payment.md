# Pagos de gasto

Base URL: `/api/v1/expenses/expense-payment`

## Modelo (Prisma: `ExpensePayment`)

- `id` (Int, autoincrement)
- `invoiceExpenseId` (Int, requerido) → FK a `InvoiceExpense.id`
- `paymentMethodId` (Int, requerido) → FK a `PaymentMethod.id`
- `amount` (Decimal)
- `exchangeRateId` (Int, requerido) → FK a `ExchangeRate.id`
- `date_at` (DateTime?, default: `now()`)

Relaciones:

- `ExpensePayment.invoiceExpenseId -> InvoiceExpense.id`
- `ExpensePayment.paymentMethodId -> PaymentMethod.id`
- `ExpensePayment.exchangeRateId -> ExchangeRate.id`

Notas:

- `amount` es `Decimal`: en respuestas normalmente llega como **string**.

## POST `/`

Qué hace:

- Registra un pago asociado a un gasto (`InvoiceExpense`).

Cómo usarlo (pasos):

1) Verifica que exista el `invoiceExpenseId`.
2) Verifica que exista el `paymentMethodId`.
3) Define `amount` (> 0).
4) Define `exchangeRateId` (tasa usada para conversiones/reportes).
5) (Opcional) Define `date_at`.
6) Envía el JSON.

Body:

- `invoiceExpenseId` (int > 0, **requerido**, debe existir)
- `paymentMethodId` (int > 0, **requerido**, debe existir)
- `amount` (number, **requerido**, > 0)
- `exchangeRateId` (int > 0, **requerido**, debe existir)
- `date_at?` (string ISO)

Request (JSON):

```json
{
  "invoiceExpenseId": 1,
  "paymentMethodId": 1,
  "amount": 50,
  "exchangeRateId": 1,
  "date_at": "2026-03-23T12:00:00.000Z"
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Pago de gasto creado éxitosamente",
  "data": {
    "id": 1,
    "invoiceExpenseId": 1,
    "paymentMethodId": 1,
    "amount": "50",
    "exchangeRateId": 1,
    "date_at": "2026-03-23T12:00:00.000Z",
    "paymentMethod": { "id": 1, "name": "Efectivo USD", "type": "cash", "currency": "USD" },
    "exchangeRate": { "id": 1, "rate": "38.5", "createdAt": "2026-03-23T12:00:00.000Z", "is_active": true },
    "invoiceExpense": {
      "id": 1,
      "categoryId": 1,
      "supplierId": 1,
      "exchangeRateId": 1,
      "total_amount": "120",
      "date_at": "2026-03-23T12:00:00.000Z",
      "category": { "id": 1, "name": "Servicios" },
      "supplier": { "id": 1, "name": "Proveedor A", "contact": "María", "phone": "+58-000-0000" }
    }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista pagos.
- `GET /:id`: obtiene un pago.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina (hard delete).

DELETE es hard delete.
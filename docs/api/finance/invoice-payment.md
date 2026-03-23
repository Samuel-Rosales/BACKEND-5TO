# Pagos de factura

Base URL: `/api/v1/finance/invoice-payment`

## POST `/`

Body:

- `invoiceId` (int > 0, **requerido**, debe existir)
- `paymentMethodId` (int > 0, **requerido**, debe existir)
- `currencyId` (int > 0, **requerido**)
- `amount_paid` (number, **requerido**, > 0)
- `exchangeRateId?` (int > 0, debe existir; si no se envía se usa la tasa activa)

Request (JSON):

```json
{
  "invoiceId": 1,
  "paymentMethodId": 1,
  "currencyId": 1,
  "amount_paid": 100,
  "exchangeRateId": 1
}
```

Regla IGTF:

- `igtf_amount` se calcula como `amount_paid * 0.03` solo si:
  - el `paymentMethod.type` contiene `cash` o `efectivo`, y
  - el `paymentMethod.currency` contiene `usd`, `dolar`/`dólar` o `$`.

Response (201) (ejemplo, con IGTF aplicado):

```json
{
  "message": "Pago de factura registrado éxitosamente",
  "data": {
    "id": 1,
    "invoiceId": 1,
    "paymentMethodId": 1,
    "currencyId": 1,
    "amount_paid": 100,
    "igtf_amount": 3,
    "exchangeRateId": 1,
    "paymentMethod": { "id": 1, "name": "Efectivo USD", "type": "cash", "currency": "usd", "is_active": true },
    "exchangeRate": { "id": 1, "rate": "38.5", "createdAt": "2026-03-23T12:00:00.000Z", "is_active": true }
  }
}
```

## GET `/` / GET `/:id`

Respuesta `data`: `InvoicePayment[]` / `InvoicePayment`.

## PUT `/:id`

Body:

- `paymentMethodId?`, `currencyId?`, `amount_paid?`, `exchangeRateId?`

Request (JSON):

```json
{
  "amount_paid": 120
}
```

- Si no existe: `404` con `data: null`.

Response (404):

```json
{
  "message": "Pago de factura no encontrado",
  "data": null
}
```

## DELETE `/:id`

DELETE es hard delete.
# Pagos de factura

Base URL: `/api/v1/finance/invoice-payment`

## Modelo (Prisma: `InvoicePayment`)

- `id` (Int, autoincrement)
- `invoiceId` (Int, requerido) → FK a `Invoice.id`
- `paymentMethodId` (Int, requerido) → FK a `PaymentMethod.id`
- `currencyId` (Int, requerido)
- `amount_paid` (Decimal, requerido)
- `igtf_amount` (Decimal, default: `0`)
- `exchangeRateId` (Int, requerido) → FK a `ExchangeRate.id`

Relaciones:

- `InvoicePayment.invoiceId -> Invoice.id`
- `InvoicePayment.paymentMethodId -> PaymentMethod.id`
- `InvoicePayment.exchangeRateId -> ExchangeRate.id`

Notas:

- `currencyId` existe en el schema como `Int`, pero no hay un modelo `Currency` declarado en este `schema.prisma`. En la práctica, puede ser:
  - un catálogo externo/tabla no incluida, o
  - un identificador usado por la API.
- `amount_paid` y `igtf_amount` son `Decimal`.

## POST `/`

Qué hace:

- Registra un pago de factura y, si aplica, calcula IGTF.

Cómo usarlo (pasos):

1) Verifica que exista `invoiceId`.
2) Selecciona `paymentMethodId` (define tipo y moneda).
3) Define `currencyId` (según tu catálogo).
4) Define `amount_paid` (> 0).
5) Define `exchangeRateId` (requerido en BD) o deja que el backend use la tasa activa si la API lo permite.
6) Envía el JSON.

Body:

- `invoiceId` (int > 0, **requerido**, debe existir)
- `paymentMethodId` (int > 0, **requerido**, debe existir)
- `currencyId` (int > 0, **requerido**)
- `amount_paid` (number, **requerido**, > 0)
- `exchangeRateId?` (int > 0; **en BD es requerido**; si no se envía el backend puede usar la tasa activa)

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

Qué hacen:

- `GET /`: lista pagos.
- `GET /:id`: obtiene un pago.

Respuesta `data`: `InvoicePayment[]` / `InvoicePayment`.

## PUT `/:id`

Qué hace:

- Actualiza campos del pago.

Cómo usarlo:

- Envía solo los campos a cambiar.

Body:

- `paymentMethodId?`, `currencyId?`, `amount_paid?`, `exchangeRateId?`

Request (JSON):

```json
{
  "amount_paid": 120
}
```

- Si no existe: `400` (validación) con `message: "El pago de factura no existe"`.

Response (400) (ejemplo):

```json
{
  "message": "El pago de factura no existe",
  "errors": [
    {
      "type": "field",
      "value": "999",
      "msg": "El pago de factura no existe",
      "path": "id",
      "location": "params"
    }
  ]
}
```

## DELETE `/:id`

Qué hace:

- Elimina el pago (hard delete).

DELETE es hard delete.
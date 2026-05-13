# Gastos (InvoiceExpense)

Base URL: `/api/v1/expenses/invoice-expense`

## Modelo (Prisma: `InvoiceExpense`)

- `id` (Int, autoincrement)
- `categoryId` (Int, requerido) → FK a `ExpenseCategory.id`
- `supplierId` (Int, requerido) → FK a `Supplier.id`
- `exchangeRateId` (Int, **requerido en BD**) → FK a `ExchangeRate.id`
- `total_amount` (Decimal)
- `date_at` (DateTime?, default: `now()`)

Relaciones:

- `InvoiceExpense (1) -> (N) ExpensePayment`

Notas:

- `total_amount` es `Decimal`: en respuestas normalmente llega como **string**.
- Aunque `exchangeRateId` es requerido en BD, algunos backends lo pueden resolver automáticamente si no lo envías.

## POST `/`

Qué hace:

- Crea un gasto (`InvoiceExpense`) y (opcionalmente) registra uno o más pagos asociados.

Cómo usarlo (pasos):

1) Crea/obtén `categoryId` y `supplierId`.
2) Define `total_amount` (monto total en USD según el modelo).
3) Define `exchangeRateId` (requerido en BD) o deja que el backend lo resuelva si la API lo permite.
4) Arma `payments[]` con métodos de pago y montos.
5) Envía el JSON.

Body:

- `categoryId` (int > 0, **requerido**, debe existir)
- `supplierId` (int > 0, **requerido**, debe existir)
- `exchangeRateId` (int > 0, **requerido en BD**; debe existir)
- `total_amount` (number, **requerido**, > 0) — **monto total en USD**
- `date_at?` (string ISO)
- `payments` (array, **requerido**, min 1)
  - `paymentMethodId` (int > 0, **requerido**, debe existir)
  - `amount` (number, **requerido**, > 0)
  - `date_at?` (string ISO)

Notas:

- La tasa usada para convertir montos a USD es la del encabezado (`exchangeRateId`) si se envía; si no, el backend resuelve automáticamente la última tasa.
- Si el `paymentMethod.currency` es distinto a `USD`, el backend convierte a USD como: $USD = amount / rate$.
- Debe cuadrar: `sum(payments en USD)` ~= `total_amount` (tolerancia ±0.01).
- Los `ExpensePayment.exchangeRateId` creados se guardan con la **misma** tasa del encabezado.

Request (JSON):

```json
{
  "categoryId": 1,
  "supplierId": 1,
  "exchangeRateId": 1,
  "total_amount": 120,
  "date_at": "2026-03-23T12:00:00.000Z",
  "payments": [
    { "paymentMethodId": 1, "amount": 100 },
    { "paymentMethodId": 2, "amount": 770 }
  ]
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Gasto creado éxitosamente",
  "data": {
    "id": 1,
    "categoryId": 1,
    "supplierId": 1,
    "exchangeRateId": 1,
    "total_amount": "120",
    "date_at": "2026-03-23T12:00:00.000Z",
    "category": { "id": 1, "name": "Servicios" },
    "supplier": { "id": 1, "name": "Proveedor A", "contact": "María", "phone": "+58-000-0000" },
    "exchangeRate": { "id": 1, "rate": "38.5", "createdAt": "2026-03-23T12:00:00.000Z", "is_active": true },
    "payments": []
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista gastos.
- `GET /:id`: obtiene un gasto.
- `PUT /:id`: actualiza campos simples del gasto.
- `DELETE /:id`: elimina el gasto (hard delete).

Cómo usar `PUT`:

- Envía solo campos a cambiar (p.ej. `total_amount`, `date_at`, etc.) según lo soporte la API.

DELETE es hard delete.
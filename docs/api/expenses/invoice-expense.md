# Gastos (InvoiceExpense)

Base URL: `/api/v1/expenses/invoice-expense`

## POST `/`

Body:

- `categoryId` (int > 0, **requerido**, debe existir)
- `supplierId` (int > 0, **requerido**, debe existir)
- `exchangeRateId?` (int > 0, opcional; debe existir si se envía; si no se envía se usa la última tasa del sistema — primero intenta la activa más reciente)
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

DELETE es hard delete.
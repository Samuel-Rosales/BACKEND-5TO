# Gastos (InvoiceExpense)

Base URL: `/api/v1/expenses/invoice-expense`

## POST `/`

Body:

- `categoryId` (int > 0, **requerido**, debe existir)
- `supplierId` (int > 0, **requerido**, debe existir)
- `exchangeRateId` (int > 0, **requerido**, debe existir)
- `total_amount` (number, **requerido**, > 0)
- `date_at?` (string ISO)

Request (JSON):

```json
{
  "categoryId": 1,
  "supplierId": 1,
  "exchangeRateId": 1,
  "total_amount": 120,
  "date_at": "2026-03-23T12:00:00.000Z"
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
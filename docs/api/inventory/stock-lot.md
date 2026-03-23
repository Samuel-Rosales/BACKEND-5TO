# Lotes de stock

Base URL: `/api/v1/inventory/stock-lot`

## POST `/`

Body:

- `quantity` (int, **requerido**, > 0)
- `productId` (int, **requerido**, debe existir y estar activo)
- `expiration_date?` (string ISO)
- `lot_cost` (number, **requerido**, > 0)

Request (JSON):

```json
{
  "quantity": 10,
  "productId": 1,
  "expiration_date": "2026-12-31T00:00:00.000Z",
  "lot_cost": 15
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Lote creado éxitosamente",
  "data": {
    "id": 1,
    "quantity": 10,
    "productId": 1,
    "expiration_date": "2026-12-31T00:00:00.000Z",
    "lot_cost": "15",
    "createdAt": "2026-03-23T12:00:00.000Z",
    "product": { "id": 1, "name": "Paracetamol", "sku": "PARA-500", "active": true }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

PUT body: mismos campos que POST pero opcionales.

DELETE es hard delete.
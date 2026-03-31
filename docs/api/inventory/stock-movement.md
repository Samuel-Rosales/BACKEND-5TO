# Movimientos de stock

Base URL: `/api/v1/inventory/stock-movement`

## POST `/`

Body:

- `supplyId` (int, **requerido**, debe existir y estar activo)
- `stockLotId` (int, **requerido**, debe existir y **pertenecer** al `supplyId`)
- `userId` (int, **requerido**, debe existir y estar activo)
- `type` (string, **requerido**, `"IN"` | `"OUT"`)
- `quantity` (int, **requerido**, > 0)
- `reason?` (string, 1..500)
- `date?` (string ISO)

Request (JSON):

```json
{
  "supplyId": 1,
  "stockLotId": 1,
  "userId": 1,
  "type": "OUT",
  "quantity": 2,
  "reason": "USO EN CONSULTA",
  "date": "2026-03-23T12:00:00.000Z"
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Movimiento creado éxitosamente",
  "data": {
    "id": 1,
    "supplyId": 1,
    "stockLotId": 1,
    "userId": 1,
    "type": "OUT",
    "quantity": 2,
    "reason": "USO EN CONSULTA",
    "date": "2026-03-23T12:00:00.000Z",
    "supply": { "id": 1, "name": "Paracetamol", "sku": "PARA-500", "active": true },
    "stockLot": { "id": 1, "supplyId": 1, "quantity": 10, "expiration_date": "2026-12-31T00:00:00.000Z", "lot_cost": "15", "createdAt": "2026-03-23T12:00:00.000Z" },
    "user": { "id": 1, "ci": "10000000", "name": "Admin", "roleId": 1, "active": true }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

PUT body: mismos campos que POST pero opcionales.

DELETE es hard delete.
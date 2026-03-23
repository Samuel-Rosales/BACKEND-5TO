# Compras

Base URL: `/api/v1/procurement/purchase`

## POST `/`

Body:

- `supplierId` (int > 0, **requerido**, debe existir)
- `userId` (int > 0, **requerido**, debe existir)
- `exchangeRateId` (int > 0, **requerido**, debe existir)
- `status?` (string, 2..80)
- `reference?` (string, 1..200)
- `observation?` (string, 1..5000)
- `discount?` (number, >= 0)
- `items` (array, **requerido**, min 1)

Cada item:

- `productId` (int > 0, **requerido**, producto debe existir y estar activo)
- `quantity` (int, **requerido**, > 0)
- `unit_cost` (number, **requerido**, > 0)
- `expiration_date?` (string ISO)

Request (JSON):

```json
{
  "supplierId": 1,
  "userId": 1,
  "exchangeRateId": 1,
  "status": "RECIBIDA",
  "reference": "FAC-123",
  "observation": "Compra de reposición",
  "discount": 0,
  "items": [
    {
      "productId": 2,
      "quantity": 10,
      "unit_cost": 1.5,
      "expiration_date": "2026-12-31T00:00:00.000Z"
    }
  ]
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Compra creada éxitosamente",
  "data": {
    "id": 1,
    "supplierId": 1,
    "userId": 1,
    "status": "RECIBIDA",
    "exchangeRateId": 1,
    "reference": "FAC-123",
    "observation": "Compra de reposición",
    "date": "2026-03-23T12:00:00.000Z",
    "discount": "0",
    "supplier": { "id": 1, "name": "Proveedor A", "contact": "María", "phone": "+58-000-0000" },
    "user": { "id": 1, "ci": "10000000", "name": "Admin", "roleId": 1, "active": true },
    "exchangeRate": { "id": 1, "rate": "38.5", "createdAt": "2026-03-23T12:00:00.000Z", "is_active": true },
    "items": [
      {
        "id": 1,
        "purchaseId": 1,
        "productId": 2,
        "quantity": 10,
        "unit_cost": "1.5",
        "expiration_date": "2026-12-31T00:00:00.000Z",
        "product": { "id": 2, "name": "Paracetamol", "sku": "PARA-500", "active": true, "cost_price": "1.5" }
      }
    ],
    "payments": []
  }
}
```

Efectos colaterales:

- Crea `stockLot` por item.
- Crea `stockMovement` tipo `IN` por lote con `reason = "PURCHASE:<purchaseId>"`.

## GET `/` / GET `/:id` / PUT `/:id`

PUT body (sin `items`):

- `supplierId?`, `userId?`, `exchangeRateId?`, `status?`, `reference?`, `observation?`, `discount?`

Request (JSON):

```json
{
  "status": "ANULADA",
  "observation": "Proveedor no despachó completo"
}
```

## DELETE `/:id`

Si los lotes generados tienen otros movimientos, retorna `400` con `data: null`.

Response (400) (ejemplo):

```json
{
  "message": "No se puede eliminar la compra porque algunos lotes tienen movimientos asociados",
  "data": null
}
```
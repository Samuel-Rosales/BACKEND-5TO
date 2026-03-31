# Compras

Base URL: `/api/v1/procurement/purchase`

## POST `/`

Body:

- `supplierId` (int > 0, **requerido**, debe existir)
- `userId` (int > 0, **requerido**, debe existir)
- `exchangeRateId?` (int > 0, opcional; debe existir si se envía; si no se envía se usa la tasa activa más reciente; si no hay activa, la última registrada)
- `status?` (string/enum; **nota**: actualmente el backend fuerza el status a `COMPLETED` al crear)
- `reference?` (string, 1..200)
- `observation?` (string, 1..5000)
- `items` (array, **requerido**, min 1)
- `payments` (array, **requerido**, min 1)

Cada item:

- `supplyId` (int > 0, **requerido**, insumo debe existir y estar activo)
- `quantity` (int, **requerido**, > 0)
- `unit_cost` (number, **requerido**, > 0)
- `expiration_date?` (string ISO)

Cada payment:

- `paymentMethodId` (int > 0, **requerido**, debe existir)
- `amount` (number, **requerido**, > 0)

Notas de payments:

- La moneda (`currency`) se toma del método de pago al registrar la compra.
- `payment_date` se registra automáticamente (fecha del servidor) al crear la compra.

Request (JSON):

```json
{
  "supplierId": 1,
  "userId": 1,
  "exchangeRateId": 1,
  "status": "RECIBIDA",
  "reference": "FAC-123",
  "observation": "Compra de reposición",
  "items": [
    {
      "supplyId": 2,
      "quantity": 10,
      "unit_cost": 1.5,
      "expiration_date": "2026-12-31T00:00:00.000Z"
    }
  ],
  "payments": [
    { "paymentMethodId": 1, "amount": 15 }
  ]
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Compra creada éxitosamente y stock actualizado por lotes",
  "data": {
    "id": 1,
    "supplierId": 1,
    "userId": 1,
    "status": "COMPLETED",
    "exchangeRateId": 1,
    "reference": "FAC-123",
    "observation": "Compra de reposición",
    "date": "2026-03-23T12:00:00.000Z",
    "discount": "0",
    "total_usd": 15,
    "total_bs": 577.5,
    "iva_rate": 16,
    "iva_usd": 2.4,
    "iva_bs": 92.4,
    "supplier": { "id": 1, "name": "Proveedor A", "contact": "María", "phone": "+58-000-0000" },
    "user": { "id": 1, "ci": "10000000", "name": "Admin", "roleId": 1, "active": true },
    "exchangeRate": { "id": 1, "rate": "38.5", "createdAt": "2026-03-23T12:00:00.000Z", "is_active": true },
    "items": [
      {
        "id": 1,
        "purchaseId": 1,
        "supplyId": 2,
        "quantity": 10,
        "unit_cost": "1.5",
        "expiration_date": "2026-12-31T00:00:00.000Z",
        "supply": { "id": 2, "name": "Paracetamol", "sku": "PARA-500", "active": true, "cost_price": "1.5" }
      }
    ],
    "payments": [
      {
        "id": 1,
        "purchaseId": 1,
        "paymentMethodId": 1,
        "amount": "15",
        "currency": "USD",
        "reference": null,
        "payment_date": "2026-03-23T12:00:00.000Z",
        "paymentMethod": { "id": 1, "name": "Efectivo", "type": "CASH", "currency": "USD", "is_active": true }
      }
    ]
  }
}
```


Efectos colaterales:

- Crea `stockLot` por item.
- Crea `stockMovement` tipo `IN` por lote con `reason = "PURCHASE:<purchaseId>"`.

## GET `/` / GET `/:id` / PUT `/:id`

PUT body (sin `items` ni `payments`):

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
  "message": "No se puede eliminar la compra: los lotes ya tienen otros movimientos de stock",
  "data": null
}
```

Response (200) (ejemplo, resumen):

```json
{
  "message": "Compra eliminada éxitosamente",
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "items": [
      { "id": 1, "purchaseId": 1, "supplyId": 2, "quantity": 10, "unit_cost": "1.5", "expiration_date": "2026-12-31T00:00:00.000Z" }
    ],
    "payments": []
  }
}
```


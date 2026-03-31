# Compras

Base URL: `/api/v1/procurement/purchase`

## Modelos (Prisma)

### `Purchase`

- `id` (Int, autoincrement)
- `supplierId` (Int, requerido) → FK a `Supplier.id`
- `userId` (Int, requerido) → FK a `User.id`
- `status` (`StatusPurchase`, requerido)
- `exchangeRateId` (Int, requerido) → FK a `ExchangeRate.id`
- `reference` (String?)
- `observation` (String?)
- `date` (DateTime?, default: `now()`)

### `PurchaseItem`

- `purchaseId` (Int, requerido) → FK a `Purchase.id`
- `supplyId` (Int, requerido) → FK a `Supply.id`
- `quantity` (Int, requerido)
- `unit_cost` (Decimal, requerido)
- `expiration_date` (DateTime?, `@db.Date`)

### `PurchasePayment`

- `purchaseId` (Int, requerido)
- `paymentMethodId` (Int, requerido)
- `amount` (Decimal, requerido)
- `currency` (String?)
- `reference` (String?)
- `payment_date` (DateTime?)

### Enum `StatusPurchase`

Valores permitidos:

- `PENDING`
- `COMPLETED`
- `CANCELLED`
- `ANULLED`

Notas:

- Los campos `Decimal` (`unit_cost`, `amount`, `rate`, etc.) normalmente se serializan como **string** en JSON.

## POST `/`

Qué hace:

- Crea una compra (`Purchase`) con sus items (`PurchaseItem[]`) y pagos (`PurchasePayment[]`).

Cómo usarlo (pasos):

1) Crea/obtén `supplierId`.
2) Determina `userId` (usuario que registra la compra).
3) Define `exchangeRateId` (en BD es requerido). Si tu backend resuelve automáticamente la tasa, puedes omitirlo solo si la API lo permite.
4) Define `status` usando los valores del enum `StatusPurchase`.
5) Arma `items[]` con `supplyId`, `quantity`, `unit_cost` y (opcional) `expiration_date`.
6) Arma `payments[]` con `paymentMethodId` y `amount` (y opcionales).
7) Envía el JSON.

Body:

- `supplierId` (int > 0, **requerido**, debe existir)
- `userId` (int > 0, **requerido**, debe existir)
- `exchangeRateId` (int > 0, **requerido en BD**, debe existir)
- `status` (enum, **requerido**, ver `StatusPurchase`)
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
  "status": "COMPLETED",
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


Notas de respuesta:

- Algunos backends devuelven campos **calculados** (totales, impuestos) aunque no existan como columnas en Prisma. Si aparecen, deben considerarse derivados de `items`, `payments`, `tax` y/o `exchangeRate`.

Efectos colaterales:

- Crea `stockLot` por item.
- Crea `stockMovement` tipo `IN` por lote con `reason = "PURCHASE:<purchaseId>"`.

## GET `/` / GET `/:id` / PUT `/:id`

Qué hacen:

- `GET /`: lista compras.
- `GET /:id`: devuelve una compra.
- `PUT /:id`: actualiza campos simples de la compra.

Cómo usar `PUT`:

1) Envía solo los campos a modificar.
2) No intentes actualizar `items`/`payments` por este endpoint si la API no lo soporta explícitamente (según schema, son tablas relacionadas).

PUT body (sin `items` ni `payments`):

- `supplierId?`, `userId?`, `exchangeRateId?`, `status?`, `reference?`, `observation?`, `date?`

Request (JSON):

```json
{
  "status": "ANULADA",
  "observation": "Proveedor no despachó completo"
}
```

## DELETE `/:id`

Qué hace:

- Elimina la compra.

Notas (schema):

- `Purchase` tiene relaciones a `PurchaseItem` y `PurchasePayment`. Si el backend no hace cascade, puede fallar por integridad referencial.

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


# Movimientos de stock

Base URL: `/api/v1/inventory/stock-movement`

## Modelo (Prisma: `StockMovement`)

- `id` (Int, autoincrement)
- `supplyId` (Int, requerido) → FK a `Supply.id`
- `stockLotId` (Int, requerido) → FK a `StockLot.id`
- `userId` (Int, requerido) → FK a `User.id`
- `type` (String) → normalmente `IN` o `OUT`
- `quantity` (Int)
- `reason` (String?)
- `date` (DateTime, default: `now()`)

Relaciones:

- `StockMovement.supplyId -> Supply.id`
- `StockMovement.stockLotId -> StockLot.id`
- `StockMovement.userId -> User.id`

Notas:

- El movimiento debe referenciar un `stockLotId` que pertenezca al mismo `supplyId`.
- `date` puede omitirse para usar la fecha del servidor.

## POST `/`

Qué hace:

- Registra un movimiento de entrada o salida de stock sobre un lote.

Cómo usarlo (pasos):

1) Selecciona el `supplyId` y el `stockLotId` correspondiente a ese insumo.
2) Define el `type`: `IN` (entrada) o `OUT` (salida).
3) Define `quantity` (> 0).
4) (Opcional) Envía `reason` y/o `date`.
5) Envía el JSON con `userId` (usuario que registra el movimiento).

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

Qué hacen:

- `GET /`: lista movimientos.
- `GET /:id`: devuelve un movimiento.
- `PUT /:id`: actualiza campos del movimiento.
- `DELETE /:id`: elimina el movimiento (según implementación puede ser borrado físico).

Cómo usar `PUT`:

- Envía solo los campos a cambiar; el resto se conserva.

PUT body: mismos campos que POST pero opcionales.

DELETE es hard delete.
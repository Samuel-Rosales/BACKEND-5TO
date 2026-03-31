# Lotes de stock

Base URL: `/api/v1/inventory/stock-lot`

## Modelo (Prisma: `StockLot`)

- `id` (Int, autoincrement)
- `quantity` (Int)
- `supplyId` (Int, requerido) → FK a `Supply.id`
- `expiration_date` (DateTime?)
- `lot_cost` (Decimal)
- `createdAt` (DateTime, default: `now()`)

Relaciones:

- `StockLot.supplyId -> Supply.id`
- `StockLot (1) -> (N) StockMovement`

Notas:

- `lot_cost` es `Decimal`: en respuestas normalmente llega como **string**.

## POST `/`

Qué hace:

- Crea un lote (una entrada de stock con costo y opcionalmente vencimiento) asociado a un insumo.

Cómo usarlo (pasos):

1) Verifica que el `supplyId` exista y esté activo.
2) Define `quantity` (> 0) y `lot_cost` (> 0).
3) (Opcional) Define `expiration_date` si el insumo es perecedero.
4) Envía el JSON.

Body:

- `quantity` (int, **requerido**, > 0)
- `supplyId` (int, **requerido**, debe existir y estar activo)
- `expiration_date?` (string ISO)
- `lot_cost` (number, **requerido**, > 0)

Request (JSON):

```json
{
  "quantity": 10,
  "supplyId": 1,
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
    "supplyId": 1,
    "expiration_date": "2026-12-31T00:00:00.000Z",
    "lot_cost": "15",
    "createdAt": "2026-03-23T12:00:00.000Z",
    "supply": {
      "id": 1,
      "name": "Paracetamol",
      "sku": "PARA-500",
      "active": true,
      "categoryId": 1,
      "unitId": 1,
      "category": { "id": 1, "name": "Medicamentos" },
      "unit": { "id": 1, "name": "Unidad", "symbol": "u" }
    }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista lotes.
- `GET /:id`: devuelve un lote.
- `PUT /:id`: actualiza campos del lote.
- `DELETE /:id`: elimina el lote (según implementación puede ser borrado físico).

Cómo usar `PUT`:

- Envía solo los campos a cambiar; el resto se conserva.

PUT body: mismos campos que POST pero opcionales.

DELETE es hard delete.
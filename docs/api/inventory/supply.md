# Insumos

Base URL: `/api/v1/inventory/supply`

## Modelo (Prisma: `Supply`)

Campos del modelo según `schema.prisma`:

- `id` (Int, autoincrement)
- `name` (String)
- `sku` (String?, **único**) → puede ser `null`
- `description` (String?)
- `image_url` (String?)
- `cost_price` (Decimal)
- `min_stock` (Int, default: `0`)
- `is_perishable` (Boolean, default: `false`)
- `active` (Boolean, default: `true`) → soft delete
- `type` (String?)
- `categoryId` (Int, requerido) → FK a `Category.id`
- `unitId` (Int, requerido) → FK a `MeasurementUnit.id`

Relaciones:

- `Supply.categoryId -> Category.id`
- `Supply.unitId -> MeasurementUnit.id`
- `Supply (1) -> (N) StockLot`
- `Supply (1) -> (N) StockMovement`
- `Supply (1) -> (N) SupplyPresentation`

Notas:

- `cost_price` es `Decimal`: en respuestas normalmente llega como **string**.
- `sku` es único: evita duplicados.

## POST `/`

Qué hace:

- Crea un insumo y lo asocia a una categoría y unidad de medida.

Cómo usarlo (pasos):

1) Crea/obtén `categoryId` (ver Categorías).
2) Crea/obtén `unitId` (ver Unidades de medida).
3) Envía el body con `name` y `cost_price`.
4) (Opcional) Envía `sku/description/min_stock/active`.

Body:

- `name` (string, **requerido**, 2..150)
- `sku?` (string, 1..60)
- `description?` (string, 1..5000)
- `cost_price` (number, **requerido**, > 0)
- `min_stock?` (int, >= 0)
- `active?` (boolean)
- `categoryId` (int > 0, **requerido**, debe existir)
- `unitId` (int > 0, **requerido**, debe existir)

Request (JSON):

```json
{
  "name": "Paracetamol",
  "sku": "PARA-500",
  "description": "Caja x 10",
  "cost_price": 1.5,
  "min_stock": 5,
  "active": true,
  "categoryId": 1,
  "unitId": 1
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Insumo creado éxitosamente",
  "data": {
    "id": 1,
    "name": "Paracetamol",
    "sku": "PARA-500",
    "description": "Caja x 10",
    "cost_price": "1.5",
    "min_stock": 5,
    "active": true,
    "categoryId": 1,
    "unitId": 1,
    "category": { "id": 1, "name": "Medicamentos" },
    "unit": { "id": 1, "name": "Unidad", "symbol": "u" }
  }
}
```


## GET `/`

Qué hace:

- Lista insumos.

Cómo usarlo:

- Para catálogo/selección, normalmente se listan solo los activos (`active: true`).

Devuelve solo insumos con `active: true`.

Response (200) (ejemplo):

```json
{
  "message": "Insumos encontrados éxitosamente",
  "data": [
    {
      "id": 1,
      "name": "Paracetamol",
      "sku": "PARA-500",
      "description": "Caja x 10",
      "cost_price": "1.5",
      "min_stock": 5,
      "active": true,
      "categoryId": 1,
      "unitId": 1,
      "category": { "id": 1, "name": "Medicamentos" },
      "unit": { "id": 1, "name": "Unidad", "symbol": "u" }
    }
  ]
}
```

## GET `/:id`

Qué hace:

- Devuelve un insumo por `id`.

Cómo usarlo:

1) Toma el `id` desde el listado.
2) Consulta el detalle para edición o para ver relaciones (`category`, `unit`).

Devuelve insumo con `active: true`.

## PUT `/:id`

Qué hace:

- Actualiza datos del insumo.

Cómo usarlo (pasos):

1) Envía solo los campos que quieras cambiar.
2) Si cambias `categoryId`/`unitId`, deben existir.
3) Si cambias `sku`, recuerda que es único.

Body (todos opcionales):

- `name?`, `sku?`, `description?`, `cost_price?`, `min_stock?`, `active?`, `categoryId?`, `unitId?`

Request (JSON):

```json
{ "min_stock": 10 }
```

## DELETE `/:id`

Qué hace:

- Realiza **soft delete**: marca el insumo como inactivo.

Cómo usarlo:

- Úsalo para retirar un insumo del catálogo sin perder historial (lotes/movimientos/relaciones).

Soft delete: setea `active: false`.

Response (200) (ejemplo):

```json
{
  "message": "Insumo eliminado éxitosamente",
  "data": {
    "id": 1,
    "name": "Paracetamol",
    "sku": "PARA-500",
    "description": "Caja x 10",
    "cost_price": "1.5",
    "min_stock": 5,
    "active": false,
    "categoryId": 1,
    "unitId": 1,
    "category": { "id": 1, "name": "Medicamentos" },
    "unit": { "id": 1, "name": "Unidad", "symbol": "u" }
  }
}
```
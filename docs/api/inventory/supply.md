# Insumos

Base URL: `/api/v1/inventory/supply`

## POST `/`

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

Devuelve solo supplyos con `active: true`.

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

Devuelve supplyo con `active: true`.

## PUT `/:id`

Body (todos opcionales):

- `name?`, `sku?`, `description?`, `cost_price?`, `min_stock?`, `active?`, `categoryId?`, `unitId?`

Request (JSON):

```json
{ "min_stock": 10 }
```

## DELETE `/:id`

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
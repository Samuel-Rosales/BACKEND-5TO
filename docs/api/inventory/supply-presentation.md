# Presentaciones de insumos

Base URL: `/api/v1/inventory/supply-presentation`

Nota:

- Los endpoints con `/:id` validan que la presentación exista; si no existe, la API responde **400** como error de validación.

## POST `/`

Body:

- `supplyId` (int, **requerido**, debe existir y estar activo)
- `name` (string, **requerido**, 2..150)
- `factor` (number, **requerido**, > 0)
- `barCode?` (string, 1..120)
- `price` (number, **requerido**, > 0)
- `isActive?` (boolean)

Request (JSON):

```json
{
  "supplyId": 1,
  "name": "Caja x 10",
  "factor": 10,
  "barCode": "1234567890",
  "price": 2.5,
  "isActive": true
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Presentación creada éxitosamente",
  "data": {
    "id": 1,
    "supplyId": 1,
    "name": "Caja x 10",
    "factor": "10",
    "barCode": "1234567890",
    "price": "2.5",
    "isActive": true,
    "supply": { "id": 1, "name": "Paracetamol", "sku": "PARA-500", "active": true }
  }
}
```

## GET `/`

Devuelve solo presentaciones con `isActive: true`.

## GET `/:id`

## PUT `/:id`

Body (todos opcionales):

- `supplyId?`, `name?`, `factor?`, `barCode?`, `price?`, `isActive?`

Request (JSON):

```json
{ "price": 3 }
```

## DELETE `/:id`

Soft delete: setea `isActive: false`.

Response (200) (ejemplo, resumen):

```json
{
  "message": "Presentación eliminada éxitosamente",
  "data": {
    "id": 1,
    "supplyId": 1,
    "name": "Caja x 10",
    "factor": "10",
    "barCode": "1234567890",
    "price": "2.5",
    "isActive": false,
    "supply": { "id": 1, "name": "Paracetamol", "sku": "PARA-500", "active": true }
  }
}
```

# Presentaciones de insumos

Base URL: `/api/v1/inventory/supply-presentation`

## Modelo (Prisma: `SupplyPresentation`)

- `id` (Int, autoincrement)
- `supplyId` (Int, requerido) → FK a `Supply.id`
- `name` (String)
- `factor` (Decimal) → factor de conversión (ej. caja x10)
- `barCode` (String?)
- `price` (Decimal)
- `isActive` (Boolean, default: `true`) → soft delete

Relación:

- `SupplyPresentation.supplyId -> Supply.id`

Notas:

- `factor` y `price` son `Decimal`: en respuestas normalmente llegan como **string**.
- `DELETE` debería desactivar (`isActive=false`) y no borrar físicamente.

Nota:

- Los endpoints con `/:id` validan que la presentación exista; si no existe, la API responde **400** como error de validación.

## POST `/`

Qué hace:

- Crea una presentación para un insumo (ej. "Caja x10", "Blister x12") con factor y precio.

Cómo usarlo (pasos):

1) Verifica que el `supplyId` exista y esté activo.
2) Define `name` y `factor`.
3) Define `price`.
4) (Opcional) Define `barCode`.
5) Envía el JSON.

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

Qué hace:

- Lista presentaciones.

Cómo usarlo:

- Normalmente se listan solo las activas (`isActive: true`).

Devuelve solo presentaciones con `isActive: true`.

## GET `/:id`

Qué hace:

- Devuelve una presentación por `id`.

## PUT `/:id`

Qué hace:

- Actualiza campos de la presentación.

Cómo usarlo:

- Envía solo los campos a cambiar.

Body (todos opcionales):

- `supplyId?`, `name?`, `factor?`, `barCode?`, `price?`, `isActive?`

Request (JSON):

```json
{ "price": 3 }
```

## DELETE `/:id`

Qué hace:

- Realiza **soft delete**: marca `isActive=false`.

Cómo usarlo:

- Útil para retirar una presentación sin perder historial/referencias.

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

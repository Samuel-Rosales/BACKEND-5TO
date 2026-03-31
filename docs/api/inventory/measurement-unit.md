# Unidades de medida

Base URL: `/api/v1/inventory/measurement-unit`

## Modelo (Prisma: `MeasurementUnit`)

- `id` (Int, autoincrement)
- `name` (String)
- `symbol` (String)
- `active` (Boolean, default: `true`) → soft delete

Relación:

- `MeasurementUnit (1) -> (N) Supply` por `Supply.unitId`.

## POST `/`

Qué hace:

- Crea una unidad de medida (ej. Unidad, ml, mg, caja).

Cómo usarlo (pasos):

1) Define `name` y `symbol`.
2) Envía el JSON. El backend asigna `id` y `active=true`.

Body:

- `name` (string, **requerido**, 2..120)
- `symbol` (string, **requerido**, 1..20)

Request (JSON):

```json
{ "name": "Unidad", "symbol": "u" }
```

Response (201):

```json
{
  "message": "Unidad de medida creada éxitosamente",
  "data": { "id": 1, "name": "Unidad", "symbol": "u", "active": true }
}
```

## GET `/`

Qué hace:

- Lista unidades de medida.

Cómo usarlo:

- Úsalo para poblar selectores en creación/edición de insumos.

Response (200) (ejemplo):

```json
{
  "message": "Unidades de medida encontradas éxitosamente",
  "data": [
    { "id": 1, "name": "Unidad", "symbol": "u", "active": true }
  ]
}
```

## GET `/:id`

Qué hace:

- Devuelve una unidad de medida por `id`.

Params:

- `id` (int > 0)

## PUT `/:id`

Qué hace:

- Actualiza `name` y/o `symbol`.

Cómo usarlo:

1) Envía solo los campos que quieras cambiar.
2) Ten en cuenta que insumos existentes pueden estar relacionados a esta unidad.

PUT body:

- `name?` (string, 2..120)
- `symbol?` (string, 1..20)

Request (JSON):

```json
{ "symbol": "und" }
```

## DELETE `/:id`

Qué hace:

- Según el modelo Prisma, el borrado recomendado es **soft delete** (`active=false`).

Cómo usarlo:

- Desactiva una unidad cuando no quieras que se use en nuevos insumos.

Soft delete: setea `active: false`.
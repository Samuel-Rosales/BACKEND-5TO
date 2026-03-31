# Unidades de medida

Base URL: `/api/v1/inventory/measurement-unit`

## POST `/`

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
  "data": { "id": 1, "name": "Unidad", "symbol": "u" }
}
```

## GET `/`

Response (200) (ejemplo):

```json
{
  "message": "Unidades de medida encontradas éxitosamente",
  "data": [
    { "id": 1, "name": "Unidad", "symbol": "u" }
  ]
}
```

## GET `/:id`

Params:

- `id` (int > 0)

## PUT `/:id`

PUT body:

- `name?` (string, 2..120)
- `symbol?` (string, 1..20)

Request (JSON):

```json
{ "symbol": "und" }
```

## DELETE `/:id`

DELETE es hard delete.
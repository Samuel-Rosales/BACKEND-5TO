# Categorías

Base URL: `/api/v1/inventory/category`

## POST `/`

Body:

- `name` (string, **requerido**, 2..120)

Request (JSON):

```json
{ "name": "Medicamentos" }
```

Response (201):

```json
{
  "message": "Categoría creada éxitosamente",
  "data": { "id": 1, "name": "Medicamentos" }
}
```

## GET `/`

Response (200):

```json
{
  "message": "Categorías encontradas éxitosamente",
  "data": [
    { "id": 1, "name": "Medicamentos" }
  ]
}
```

## GET `/:id`

Params:

- `id` (int > 0)

Response (200) (ejemplo):

```json
{
  "message": "Categoría encontrada éxitosamente",
  "data": { "id": 1, "name": "Medicamentos" }
}
```

## PUT `/:id`

Body:

- `name` (string, 2..120)

Request (JSON):

```json
{ "name": "Insumos" }
```

Response (200):

```json
{
  "message": "Categoría actualizada éxitosamente",
  "data": { "id": 1, "name": "Insumos" }
}
```

## DELETE `/:id`

DELETE es hard delete.
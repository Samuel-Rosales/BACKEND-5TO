# Categorías de gasto

Base URL: `/api/v1/expenses/category`

## POST `/`

Body:

- `name` (string, **requerido**, 2..120)

Request (JSON):

```json
{ "name": "Servicios" }
```

Response (201):

```json
{
  "message": "Categoría de gasto creada éxitosamente",
  "data": { "id": 1, "name": "Servicios" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
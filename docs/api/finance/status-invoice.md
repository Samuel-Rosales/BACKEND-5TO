# Status de factura

Base URL: `/api/v1/finance/status-invoice`

## POST `/`

Body:

- `name` (string, **requerido**, 2..80)
- `color_hex?` (string, 3..20)

Request (JSON):

```json
{
  "name": "Proforma",
  "color_hex": "#3B82F6"
}
```

Response (201):

```json
{
  "message": "Status de factura creado éxitosamente",
  "data": { "id": 1, "name": "Proforma", "color_hex": "#3B82F6" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Nota: si el `:id` no existe, el backend responde `400` (error de validación con `express-validator`).

DELETE es hard delete.
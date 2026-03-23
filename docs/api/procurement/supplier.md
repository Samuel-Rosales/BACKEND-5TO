# Proveedores

Base URL: `/api/v1/procurement/supplier`

## POST `/`

Body:

- `name` (string, **requerido**, 2..150)
- `contact?` (string, 1..150)
- `phone?` (string, 1..30)

Request (JSON):

```json
{
  "name": "Proveedor A",
  "contact": "María",
  "phone": "+58-000-0000"
}
```

Response (201):

```json
{
  "message": "Proveedor creado éxitosamente",
  "data": { "id": 1, "name": "Proveedor A", "contact": "María", "phone": "+58-000-0000" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Ejemplo PUT request:

```json
{ "phone": "+58-111-1111" }
```

DELETE es hard delete.
# Estatus de cita

Base URL: `/api/v1/scheduling/status-appointment`

## POST `/`

Body:

- `name` (string, **requerido**, 2..80)
- `color_hex?` (string HEX, ej: `#FFAA00`)

Request (JSON):

```json
{ "name": "Pendiente", "color_hex": "#F59E0B" }
```

Response (201):

```json
{
  "message": "Status de cita creado éxitosamente",
  "data": { "id": 1, "name": "Pendiente", "color_hex": "#F59E0B" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
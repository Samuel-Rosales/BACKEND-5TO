# Tipos de cita

Base URL: `/api/v1/scheduling/appointment-type`

## POST `/`

Body:

- `name` (string, **requerido**, 2..80)

Request (JSON):

```json
{ "name": "Consulta" }
```

Response (201):

```json
{
  "message": "Tipo de cita creado éxitosamente",
  "data": { "id": 1, "name": "Consulta" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
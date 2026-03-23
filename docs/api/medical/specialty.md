# Especialidades

Base URL: `/api/v1/medical/specialty`

## POST `/`

Body:

- `name` (string, **requerido**, 2..120)
- `consultation_price` (number, **requerido**, > 0)
- `commission_percentage` (number, **requerido**, 0..100)

Request (JSON):

```json
{
  "name": "Medicina General",
  "consultation_price": 50,
  "commission_percentage": 30
}
```

Response (201):

```json
{
  "message": "Especialidad creada éxitosamente",
  "data": {
    "id": 1,
    "name": "Medicina General",
    "consultation_price": "50",
    "commission_percentage": "30"
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

PUT body: mismos campos pero opcionales.

DELETE es hard delete.
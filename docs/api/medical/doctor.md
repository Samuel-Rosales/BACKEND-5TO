# Doctores

Base URL: `/api/v1/medical/doctor`

## POST `/`

Body:

- `userId` (int > 0, **requerido**, debe existir y estar activo; no puede repetirse)
- `specialtyId` (int > 0, **requerido**, debe existir)

Request (JSON):

```json
{ "userId": 12, "specialtyId": 1 }
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Doctor creado éxitosamente",
  "data": {
    "id": 3,
    "userId": 12,
    "specialtyId": 1,
    "user": { "id": 12, "ci": "20000000", "name": "Doctor", "roleId": 3, "active": true, "role": { "id": 3, "name": "Doctor", "code": "DOCTOR" } },
    "specialty": { "id": 1, "name": "Medicina General", "consultation_price": "50", "commission_percentage": "30" }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

PUT body: mismos campos pero opcionales.

DELETE es hard delete.
# Pacientes

Base URL: `/api/v1/medical/patient`

## POST `/`

Body:

- `userId?` (int > 0, debe existir y estar activo; no puede estar asociado a otro paciente activo)
- `tipo_sangre?` (string, 1..10)
- `medical_history?` (string, 1..5000)

Request (JSON):

```json
{
  "userId": 21,
  "tipo_sangre": "O+",
  "medical_history": "Sin antecedentes."
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Paciente creado éxitosamente",
  "data": {
    "id": 4,
    "userId": 21,
    "tipo_sangre": "O+",
    "medical_history": "Sin antecedentes.",
    "active": true,
    "user": {
      "id": 21,
      "ci": "30000000",
      "name": "Paciente",
      "roleId": 2,
      "active": true,
      "role": { "id": 2, "name": "Paciente", "code": "PATIENT" }
    }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id`

PUT body: mismos campos pero opcionales.

## DELETE `/:id`

Soft delete: setea `active: false`.

Response (200) (ejemplo):

```json
{
  "message": "Paciente eliminado éxitosamente",
  "data": { "id": 4, "active": false }
}
```
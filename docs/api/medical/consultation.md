# Consultas

Base URL: `/api/v1/medical/consultation`

## POST `/`

Body:

- `appointmentId?` (int > 0, debe existir)
- `patientId` (int > 0, **requerido**, debe existir y estar activo)
- `doctorId` (int > 0, **requerido**, debe existir)
- `date?` (string ISO)
- `started_at?` (string ISO)
- `finished_at?` (string ISO; si envías `started_at` también valida que `finished_at >= started_at`)
- `symptoms?` (string, 1..5000)
- `diagnosis?` (string, 1..5000)
- `physical_exam?` (string, 1..5000)

Request (JSON):

```json
{
  "appointmentId": null,
  "patientId": 4,
  "doctorId": 3,
  "date": "2026-03-23T10:00:00.000Z",
  "symptoms": "Dolor de cabeza",
  "diagnosis": "Cefalea",
  "physical_exam": "Sin hallazgos"
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Consulta creada éxitosamente",
  "data": {
    "id": 10,
    "appointmentId": null,
    "patientId": 4,
    "doctorId": 3,
    "date": "2026-03-23T10:00:00.000Z",
    "started_at": null,
    "finished_at": null,
    "symptoms": "Dolor de cabeza",
    "diagnosis": "Cefalea",
    "physical_exam": "Sin hallazgos",
    "patient": { "id": 4, "userId": 21, "tipo_sangre": "O+", "active": true, "user": { "id": 21, "ci": "V-123", "name": "Paciente" } },
    "doctor": { "id": 3, "userId": 12, "specialtyId": 1, "user": { "id": 12, "ci": "V-456", "name": "Doctor" }, "specialty": { "id": 1, "name": "Medicina General" } }
  }
}
```

## PUT `/:id`

Si `finished_at` pasa de `null` a **no-null** y no hay factura, intenta crear una factura automáticamente.

Request (JSON) (finalizar consulta):

```json
{
  "started_at": "2026-03-23T10:00:00.000Z",
  "finished_at": "2026-03-23T10:30:00.000Z"
}
```

## GET `/` / GET `/:id` / DELETE `/:id`

DELETE es hard delete.
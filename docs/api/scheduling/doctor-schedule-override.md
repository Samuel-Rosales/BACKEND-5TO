# Overrides de agenda del doctor

Base URL: `/api/v1/scheduling/doctor-schedule-override`

## POST `/`

Body:

- `doctorId` (int > 0, **requerido**, debe existir y estar activo)
- `specific_date` (string ISO, **requerido**)
- `is_working?` (boolean)
- `start_time?` (string ISO)
- `end_time?` (string ISO)
- `reason?` (string, 1..500)

Request (JSON):

```json
{
  "doctorId": 3,
  "specific_date": "2026-03-24T00:00:00.000Z",
  "is_working": false,
  "reason": "Día libre"
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Override creado éxitosamente",
  "data": {
    "id": 1,
    "doctorId": 3,
    "specific_date": "2026-03-24T00:00:00.000Z",
    "is_working": false,
    "start_time": null,
    "end_time": null,
    "reason": "Día libre",
    "doctor": { "id": 3, "userId": 12, "specialtyId": 1, "active": true, "user": { "id": 12, "ci": "V-456", "name": "Doctor" }, "specialty": { "id": 1, "name": "Medicina General", "active": true } }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
# Disponibilidad de doctor

Base URL: `/api/v1/scheduling/doctor-availability`

## POST `/`

Body:

- `doctorId` (int > 0, **requerido**, debe existir y estar activo)
- `day_of_week` (int, **requerido**, 0..6)
- `start_time` (string ISO, **requerido**)
- `end_time` (string ISO, **requerido**, debe ser `> start_time`)
- `slot_duration` (int, **requerido**, 1..1440)

Request (JSON):

```json
{
  "doctorId": 3,
  "day_of_week": 1,
  "start_time": "2026-03-23T08:00:00.000Z",
  "end_time": "2026-03-23T12:00:00.000Z",
  "slot_duration": 30
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Disponibilidad creada éxitosamente",
  "data": {
    "id": 1,
    "doctorId": 3,
    "day_of_week": 1,
    "start_time": "2026-03-23T08:00:00.000Z",
    "end_time": "2026-03-23T12:00:00.000Z",
    "slot_duration": 30,
    "doctor": { "id": 3, "userId": 12, "specialtyId": 1, "active": true, "user": { "id": 12, "ci": "20000000", "name": "Doctor" }, "specialty": { "id": 1, "name": "Medicina General", "active": true } }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
# Disponibilidad de doctor

Base URL: `/api/v1/scheduling/doctor-availability`

## POST `/`

Body:

- `doctorId` (int > 0, **requerido**, debe existir y estar activo)
- `day_of_week` (int, **requerido**, 0..6)
- `start_time` (string ISO, **requerido**)
- `end_time` (string ISO, **requerido**, debe ser `> start_time`)
- `patient_limit` (int, **requerido**, > 0)

Request (JSON):

```json
{
  "doctorId": 3,
  "day_of_week": 1,
  "start_time": "2026-03-23T08:00:00.000Z",
  "end_time": "2026-03-23T12:00:00.000Z",
  "patient_limit": 10
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
    "patient_limit": 10,
    "doctor": { "id": 3, "userId": 12, "specialtyId": 1, "active": true, "user": { "id": 12, "ci": "20000000", "name": "Doctor" }, "specialty": { "id": 1, "name": "Medicina General", "active": true } }
  }
}
```

## GET `/`

Filtros (query params, todos opcionales):

- `doctorId` (int > 0) — filtra por doctor
- `specialtyId` (int > 0) — filtra por especialidad
- `day_of_week` (int, 0..6) — filtra por día de la semana
- `date` (string, **YYYY-MM-DD**) — filtra por una fecha específica (convierte a `day_of_week` automáticamente). Si envías `date`, tiene prioridad sobre `day_of_week`.
- `morning` (`true|false`) — si `true`, solo horarios con `start_time` antes de las 12:00

Notas sobre `date`:

- Si envías `doctorId` + `date`, se toma en cuenta `DoctorScheduleOverride` para esa fecha:
  - Si existe override con `is_working=false`, la respuesta será vacía.
  - Si existe override con `start_time`/`end_time`, los horarios se limitan a esa ventana.

Ejemplos:

- Por doctor: `GET /?doctorId=3`
- Por especialidad: `GET /?specialtyId=1`
- Por día de semana: `GET /?day_of_week=1`
- Por fecha: `GET /?date=2026-03-28`
- Por fecha + doctor + mañana: `GET /?doctorId=3&date=2026-03-28&morning=true`

## GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
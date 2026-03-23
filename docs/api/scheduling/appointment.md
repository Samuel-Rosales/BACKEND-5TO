# Citas

Base URL: `/api/v1/scheduling/appointment`

## POST `/`

Body:

- `doctorId` (int > 0, **requerido**, debe existir y estar activo)
- `patientId` (int > 0, **requerido**, debe existir y estar activo)
- `statusId` (int > 0, **requerido**, debe existir)
- `typeId` (int > 0, **requerido**, debe existir)
- `reson_visit?` (string, 1..5000)
- `price` (number, **requerido**, > 0)
- `start_datetime` (string ISO, **requerido**)
- `end_datetime` (string ISO, **requerido**, debe ser `> start_datetime`)

Request (JSON):

```json
{
  "doctorId": 3,
  "patientId": 4,
  "statusId": 1,
  "typeId": 1,
  "reson_visit": "Dolor de cabeza",
  "price": 50,
  "start_datetime": "2026-03-23T14:00:00.000Z",
  "end_datetime": "2026-03-23T14:30:00.000Z"
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Cita creada éxitosamente",
  "data": {
    "id": 1,
    "doctorId": 3,
    "patientId": 4,
    "statusId": 1,
    "typeId": 1,
    "reson_visit": "Dolor de cabeza",
    "price": "50",
    "start_datetime": "2026-03-23T14:00:00.000Z",
    "end_datetime": "2026-03-23T14:30:00.000Z",
    "doctor": { "id": 3, "userId": 12, "specialtyId": 1, "active": true, "user": { "id": 12, "ci": "V-456", "name": "Doctor" }, "specialty": { "id": 1, "name": "Medicina General", "active": true } },
    "patient": { "id": 4, "userId": 21, "active": true, "user": { "id": 21, "ci": "V-123", "name": "Paciente" } },
    "status": { "id": 1, "name": "Pendiente", "color_hex": "#F59E0B" },
    "type": { "id": 1, "name": "Consulta" }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Ejemplo PUT request:

```json
{ "statusId": 2 }
```

DELETE es hard delete.
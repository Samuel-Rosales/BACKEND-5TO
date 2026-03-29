# Citas

Base URL: `/api/v1/scheduling/appointment`

## POST `/`

Body:

- `doctorId` (int > 0, opcional, debe existir y estar activo)
- `specialtyId` (int > 0, opcional, debe existir y estar activa)
- `patientId` (int > 0, **requerido**, debe existir y estar activo)
- `statusId` (int > 0, **requerido**, debe existir)
- `typeId` (int > 0, **requerido**, debe existir)
- `reson_visit?` (string, 1..5000)
- `price` (number, **requerido**, > 0)
- `date_time` (string ISO, **requerido**)

Regla:

- Debe enviar **exactamente uno**: `doctorId` **o** `specialtyId`.
- Al crear, se valida que exista horario disponible para ese doctor (o para algún doctor de la especialidad) en esa fecha/hora.

Request (JSON):

```json
{
  "specialtyId": 1,
  "patientId": 4,
  "statusId": 1,
  "typeId": 1,
  "reson_visit": "Dolor de cabeza",
  "price": 50,
  "date_time": "2026-03-23T14:00:00.000Z"
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
    "date_time": "2026-03-23T14:00:00.000Z",
    "doctor": { "id": 3, "userId": 12, "specialtyId": 1, "active": true, "user": { "id": 12, "ci": "20000000", "name": "Doctor" }, "specialty": { "id": 1, "name": "Medicina General", "active": true } },
    "patient": { "id": 4, "userId": 21, "active": true, "user": { "id": 21, "ci": "30000000", "name": "Paciente" } },
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
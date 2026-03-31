# Doctores

Base URL: `/api/v1/medical/doctor`

## Modelo (Prisma: `Doctor`)

- `id` (Int, autoincrement)
- `userId` (Int, **único**, requerido) → FK a `User.id`
- `specialtyId` (Int, requerido) → FK a `MedicalSpecialty.id`
- `active` (Boolean, default: `true`) → soft delete

Relaciones:

- `Doctor (1) -> (N) Appointment`
- `Doctor (1) -> (N) Consultation`
- `Doctor (1) -> (N) DoctorAvailability`
- `Doctor (1) -> (N) DoctorScheduleOverride`

Notas:

- `userId` es único: un usuario no puede estar duplicado como doctor.
- `DELETE` recomendado como soft delete (`active=false`).

## POST `/`

Qué hace:

- Crea un doctor asociado a un usuario y una especialidad.

Cómo usarlo (pasos):

1) Selecciona un `userId` existente, activo y con rol adecuado.
2) Selecciona `specialtyId`.
3) Envía el JSON.

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

Qué hacen:

- `GET /`: lista doctores.
- `GET /:id`: obtiene un doctor.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: desactiva/elimina.

Cómo usar `PUT`:

- Envía solo campos a cambiar.

PUT body: mismos campos pero opcionales.

Soft delete recomendado: setea `active: false`.
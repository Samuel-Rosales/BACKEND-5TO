# Pacientes

Base URL: `/api/v1/medical/patient`

## Modelo (Prisma: `Patient`)

- `id` (Int, autoincrement)
- `userId` (Int?, **único**) → FK a `User.id` (opcional)
- `tipo_sangre` (String?)
- `medical_history` (String?)
- `last_visit_at` (DateTime?)
- `active` (Boolean, default: `true`) → soft delete

Relaciones:

- `Patient (1) -> (N) Appointment`
- `Patient (1) -> (N) Invoice`

Notas:

- `userId` es opcional pero si se usa, es único (un usuario no puede ser paciente dos veces).
- `DELETE` recomendado como soft delete (`active=false`).

## POST `/`

Qué hace:

- Crea un paciente y opcionalmente lo asocia a un `User`.

Cómo usarlo (pasos):

1) (Opcional) Selecciona un `userId` existente y activo.
2) (Opcional) Registra `tipo_sangre` y `medical_history`.
3) Envía el JSON.

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

Qué hacen:

- `GET /`: lista pacientes.
- `GET /:id`: obtiene un paciente.
- `PUT /:id`: actualiza campos.

Cómo usar `PUT`:

- Envía solo los campos a cambiar.

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
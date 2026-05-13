# Pacientes

Base URL: `/api/v1/medical/patient`

## Modelo (Prisma: `Patient`)

- `id` (Int, autoincrement)
- `userId` (Int?) → FK a `User.id` (opcional)
- `ci` (String?)
- `name` (String?)
- `tipo_sangre` (String?)
- `medical_history` (String?)
- `last_visit_at` (DateTime?)
- `active` (Boolean, default: `true`) → soft delete

Relaciones:

- `Patient (1) -> (N) Appointment`
- `Patient (1) -> (N) Invoice`

Notas:

- `userId` es opcional. Si se usa, un `User` puede gestionar **múltiples** pacientes.
- `ci` y `name` viven en `Patient` para permitir varios pacientes bajo un mismo usuario.
- `DELETE` recomendado como soft delete (`active=false`).

## POST `/`

Qué hace:

- Crea un paciente y opcionalmente lo asocia a un `User` (gestor/propietario).

Cómo usarlo (pasos):

1) (Recomendado) Envía `ci` y `name` del paciente.
2) (Opcional) Envía `userId` si quieres asociar el paciente a un usuario.
3) (Opcional) Registra `tipo_sangre` y `medical_history`.
3) Envía el JSON.

Body:

- `userId?` (int > 0, debe existir y estar activo)
- `ci?` (string, 3..30)
- `name?` (string, 2..120)
- `tipo_sangre?` (string, 1..10)
- `medical_history?` (string, 1..5000)

Regla:

- Debe enviar `userId` **o** ambos campos `ci` y `name`.

Request (JSON):

```json
{
  "userId": 21,
  "ci": "V-12345678",
  "name": "Juan Pérez",
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
    "ci": "V-12345678",
    "name": "Juan Pérez",
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
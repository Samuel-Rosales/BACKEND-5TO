# Especialidades

Base URL: `/api/v1/medical/specialty`

## Modelo (Prisma: `MedicalSpecialty`)

- `id` (Int, autoincrement)
- `name` (String)
- `consultation_price` (Decimal)
- `commission_percentage` (Decimal)
- `active` (Boolean, default: `true`) → soft delete

Relación:

- `MedicalSpecialty (1) -> (N) Doctor`.

Notas:

- `consultation_price` y `commission_percentage` son `Decimal`: en respuestas normalmente llegan como **string**.
- Para retirar una especialidad, suele bastar con `active=false`.

## POST `/`

Qué hace:

- Crea una especialidad médica con su precio base de consulta y porcentaje de comisión.

Cómo usarlo (pasos):

1) Define `name`.
2) Define `consultation_price` (> 0).
3) Define `commission_percentage` (0..100).
4) Envía el JSON.

Body:

- `name` (string, **requerido**, 2..120)
- `consultation_price` (number, **requerido**, > 0)
- `commission_percentage` (number, **requerido**, 0..100)

Request (JSON):

```json
{
  "name": "Medicina General",
  "consultation_price": 50,
  "commission_percentage": 30
}
```

Response (201):

```json
{
  "message": "Especialidad creada éxitosamente",
  "data": {
    "id": 1,
    "name": "Medicina General",
    "consultation_price": "50",
    "commission_percentage": "30"
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista especialidades.
- `GET /:id`: obtiene una.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: desactiva/elimina.

PUT body: mismos campos pero opcionales.

Soft delete recomendado: setea `active: false`.
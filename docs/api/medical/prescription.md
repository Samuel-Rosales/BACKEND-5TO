# Prescripciones

Base URL: `/api/v1/medical/prescription`

## Modelo (Prisma: `Prescription`)

- `id` (Int, autoincrement)
- `consultationId` (Int, requerido) → FK a `Consultation.id`
- `supplyId` (Int?) → FK a `Supply.id` (opcional)
- `medication_name` (String?)
- `dosage` (String?)
- `frequency` (String?)
- `duration` (String?)
- `instructions` (String?)
- `active` (Boolean, default: `true`) → permite desactivar prescripciones sin borrarlas (si el backend lo usa)

Relaciones:

- `Prescription.consultationId -> Consultation.id`
- `Prescription.supplyId -> Supply.id`

## POST `/`

Qué hace:

- Crea una prescripción asociada a una consulta, ya sea referenciando un insumo (`supplyId`) o por nombre libre (`medication_name`).

Cómo usarlo (pasos):

1) Verifica que exista `consultationId`.
2) Envía **uno** de estos: `supplyId` o `medication_name`.
3) (Opcional) completa dosis/frecuencia/duración/instrucciones.
4) Envía el JSON.

Body:

- `consultationId` (int > 0, **requerido**, debe existir)
- `supplyId?` (int > 0, insumo debe existir y estar activo)
- `medication_name?` (string, 1..150)
- `dosage?` (string, 1..100)
- `frequency?` (string, 1..100)
- `duration?` (string, 1..100)
- `instructions?` (string, 1..5000)

Regla: enviar **al menos uno**: `supplyId` o `medication_name`.

Request (JSON) (por producto):

```json
{
  "consultationId": 10,
  "supplyId": 1,
  "dosage": "500mg",
  "frequency": "Cada 8h",
  "duration": "3 días",
  "instructions": "Tomar después de comer"
}
```

Request (JSON) (por nombre libre):

```json
{
  "consultationId": 10,
  "medication_name": "Acetaminofén",
  "dosage": "500mg"
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Prescripción creada éxitosamente",
  "data": {
    "id": 1,
    "consultationId": 10,
    "supplyId": 1,
    "medication_name": null,
    "dosage": "500mg",
    "frequency": "Cada 8h",
    "duration": "3 días",
    "instructions": "Tomar después de comer",
    "active": true,
    "supply": { "id": 1, "name": "Paracetamol", "sku": "PARA-500" }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista prescripciones.
- `GET /:id`: obtiene una.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina (hard delete).

DELETE es hard delete.
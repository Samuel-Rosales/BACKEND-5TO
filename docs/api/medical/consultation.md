# Consultas

Base URL: `/api/v1/medical/consultation`

## POST `/`

Body:

- `invoiceId` (int > 0, **requerido**, debe existir)
- `doctorId` (int > 0, **requerido**, debe existir)

Notas:

- `invoiceId` es **único** por consulta (1 factura ↔ 1 consulta).

Request (JSON):

```json
{
  "invoiceId": 10,
  "doctorId": 3,
  "date": "2026-03-23T10:00:00.000Z"
}
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Consulta creada éxitosamente",
  "data": {
    "id": 10,
    "invoiceId": 10,
    "doctorId": 3,
    "date": "2026-03-23T10:00:00.000Z",
    "started_at": "2026-03-23T10:00:00.000Z",
    "finished_at": null,
    "invoice": {
      "id": 10,
      "patientId": 4,
      "total_usd": "20.00",
      "patient": {
        "id": 4,
        "user": { "ci": "30000000", "name": "Paciente" }
      }
    },
    "doctor": {
      "id": 3,
      "userId": 12,
      "specialtyId": 1,
      "user": { "id": 12, "ci": "20000000", "name": "Doctor" },
      "specialty": { "id": 1, "name": "Medicina General" }
    }
  }
}
```

## PUT `/:id`

Actualiza campos básicos de la consulta.

Body (todos opcionales):

- `doctorId` (int > 0, debe existir)
- `date` (string ISO)
- `started_at` (string ISO)
- `finished_at` (string ISO; si envías `started_at` también valida que `finished_at >= started_at`)

Request (JSON) (ejemplo):

```json
{
  "finished_at": "2026-03-23T10:30:00.000Z"
}
```

## PUT `/:id/finish`

Finaliza una consulta enviando **todo** el detalle clínico relacionado.

Regla de integridad:

- Las colecciones relacionadas se **reemplazan completas** (estrategia *replace*). Enviar siempre el set completo (aunque sea `[]`).

Body:

- `finished_at?` (string ISO)
- `supplies` (**requerido**, array)
  - `productId` (int > 0, debe existir)
  - `quantity` (number > 0)
- `prescriptions` (**requerido**, array)
  - `productId?` (int > 0, debe existir)
  - `medication_name?` (string)
  - `dosage?` (string)
  - `frequency?` (string)
  - `duration?` (string)
  - `instructions?` (string)
  - `active?` (boolean)
- `symptomsConsultas` (**requerido**, array)
  - `symptomId` (int > 0, debe existir)
  - `severity` (string 1..50)
  - `duration` (string 1..100)
  - `notes?` (string)
- `clinicalExaminations` (**requerido**, array)
  - `weight?` (number > 0)
  - `height?` (number > 0)
  - `temperature?` (number > 0)
  - `systolic_bp?` (int > 0)
  - `diastolic_bp?` (int > 0)
  - `heart_rate?` (int > 0)
  - `respiratory_rate?` (int > 0)
  - `oxygen_saturation?` (number > 0)
- `consultationDiagnoses` (**requerido**, array)
  - `diagnosisId` (int > 0, debe existir)
  - `is_primary` (boolean, máximo 1 `true` por request)
  - `condition_status?` (string 1..50)
  - `onset_date?` (string ISO)

Request (JSON) (ejemplo):

```json
{
  "finished_at": "2026-03-23T10:30:00.000Z",
  "supplies": [
    { "productId": 1, "quantity": 1 }
  ],
  "prescriptions": [
    {
      "medication_name": "Ibuprofeno",
      "dosage": "400mg",
      "frequency": "Cada 8h",
      "duration": "3 días",
      "instructions": "Tomar con comida",
      "active": true
    }
  ],
  "symptomsConsultas": [
    {
      "symptomId": 2,
      "severity": "moderado",
      "duration": "2 días",
      "notes": "Empeora en la tarde"
    }
  ],
  "clinicalExaminations": [
    {
      "weight": 70.5,
      "height": 1.72,
      "temperature": 36.7,
      "systolic_bp": 120,
      "diastolic_bp": 80,
      "heart_rate": 75,
      "respiratory_rate": 16,
      "oxygen_saturation": 98
    }
  ],
  "consultationDiagnoses": [
    {
      "diagnosisId": 1,
      "is_primary": true,
      "condition_status": "agudo",
      "onset_date": "2026-03-23T00:00:00.000Z"
    }
  ]
}
```

## GET `/` / GET `/:id` / DELETE `/:id`

DELETE es hard delete.
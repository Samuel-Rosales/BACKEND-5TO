# Consultas

Base URL: `/api/v1/medical/consultation`

## Modelo (Prisma: `Consultation`)

- `id` (Int, autoincrement)
- `invoiceId` (Int, **único**, requerido) → FK a `Invoice.id`
- `doctorId` (Int, requerido) → FK a `Doctor.id`
- `date` (Date, default: `now()`; `@db.Date`)
- `started_at` (DateTime, default: `now()`)
- `finished_at` (DateTime?)

Relaciones:

- `Consultation.invoiceId -> Invoice.id`
- `Consultation.doctorId -> Doctor.id`
- `Consultation.supplies` (`SupplyConsultation[]`)
- `Consultation.prescriptions` (`Prescription[]`)

Formato de respuesta (éxito / error de service):

```json
{
  "message": "string",
  "data": {},
  "error": "string | undefined"
}
```

Errores de validación (400):

```json
{
  "message": "<mensaje del primer error>",
  "errors": [
    {
      "type": "field",
      "value": "...",
      "msg": "...",
      "path": "campo",
      "location": "body|params|query"
    }
  ]
}
```

## Endpoints

- POST `/`
- GET `/`
- GET `/:id`
- PUT `/:id`
- PUT `/:id/finish`
- DELETE `/:id`

Sub-recursos (anidados por consulta):

- SymptomsConsultas: `/:id/symptoms-consultas`
- ClinicalExaminations: `/:id/clinical-examinations`
- ConsultationDiagnoses: `/:id/consultation-diagnoses`

Notas:

- `invoiceId` es **único** por consulta (1 factura ↔ 1 consulta).
- `date` en el modelo es tipo Date (`@db.Date`): el componente hora puede perderse en DB.

---

## POST `/`

Crea una consulta.

Body:

- `invoiceId` (int > 0, **requerido**, debe existir)
- `doctorId` (int > 0, **requerido**, debe existir)
- `date?` (string ISO, opcional)

Request (JSON):

```json
{
  "invoiceId": 10,
  "doctorId": 3,
  "date": "2026-03-23T00:00:00.000Z"
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
    "date": "2026-03-23T00:00:00.000Z",
    "started_at": "2026-03-23T10:00:00.000Z",
    "finished_at": null,
    "invoice": {
      "id": 10,
      "patientId": 4,
      "total_usd": "20.00",
      "patient": {
        "id": 4,
        "ci": "V-12345678",
        "name": "Juan Pérez",
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

---

## GET `/`

Lista consultas.

Response (200) (ejemplo):

```json
{
  "message": "Consultas encontradas éxitosamente",
  "data": [
    {
      "id": 10,
      "invoiceId": 10,
      "doctorId": 3,
      "date": "2026-03-23T00:00:00.000Z",
      "started_at": "2026-03-23T10:00:00.000Z",
      "finished_at": null,
      "invoice": { "id": 10, "patientId": 4, "total_usd": "20.00", "patient": { "id": 4, "ci": "V-12345678", "name": "Juan Pérez", "user": { "ci": "30000000", "name": "Paciente" } } },
      "doctor": { "id": 3, "userId": 12, "specialtyId": 1, "user": { "id": 12, "ci": "20000000", "name": "Doctor" }, "specialty": { "id": 1, "name": "Medicina General" } }
    }
  ]
}
```

---

## GET `/:id`

Obtiene una consulta por ID.

Params:

- `id` (int > 0)

Response (200): mismo shape que en POST.

---

## PUT `/:id`

Actualiza campos básicos de la consulta.

Params:

- `id` (int > 0)

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

Response (200): mismo shape que en POST.

---

## PUT `/:id/finish`

Finaliza una consulta y guarda **todo** el detalle clínico relacionado en una transacción.

Reglas:

- Estrategia *replace*: sobrescribe por completo `supplies`, `prescriptions`, `symptomsConsultas`, `clinicalExaminations`, `consultationDiagnoses`.
- Siempre enviar arreglos (aunque sean `[]`).
- Diagnósticos: máximo 1 elemento con `is_primary=true` en el request.

Params:

- `id` (int > 0)

Body:

- `finished_at?` (string ISO)
- `supplies` (**requerido**, array)
  - `supplyId` (int > 0, debe existir)
  - `quantity` (number > 0) (si el backend serializa Decimal, también puede venir como string)
- `prescriptions` (**requerido**, array)
  - `supplyId?` (int > 0, debe existir)
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
  - `is_primary` (boolean)
  - `condition_status?` (string 1..50)
  - `onset_date?` (string ISO)

Request (JSON) (ejemplo):

```json
{
  "finished_at": "2026-03-23T10:30:00.000Z",
  "supplies": [{ "supplyId": 1, "quantity": 1 }],
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
    { "symptomId": 2, "severity": "moderado", "duration": "2 días", "notes": "Empeora en la tarde" }
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
    { "diagnosisId": 1, "is_primary": true, "condition_status": "agudo", "onset_date": "2026-03-23T00:00:00.000Z" }
  ]
}
```

Response (200): mismo shape que en POST.

---

## DELETE `/:id`

Elimina una consulta (hard delete).

Params:

- `id` (int > 0)

Response (200): mismo shape que en POST.

---

## CRUD de relaciones (por consulta)

Estas rutas existen además de `PUT /:id/finish`.

Importante:

- Si luego llamas `PUT /:id/finish`, estas colecciones se vuelven a **reemplazar** con lo que envíes en el body.

### SymptomsConsultas

Base: `/:id/symptoms-consultas`

- GET `/`
- POST `/`
  - Body:
    - `symptomId` (int > 0, debe existir)
    - `severity` (string 1..50)
    - `duration` (string 1..100)
    - `notes?` (string 1..5000)
- PUT `/:symptomsConsultaId`
  - Params:
    - `symptomsConsultaId` (int > 0, debe pertenecer a la consulta)
  - Body: mismos campos pero opcionales
- DELETE `/:symptomsConsultaId`

Response (201, POST) (ejemplo):

```json
{
  "message": "Síntoma agregado a la consulta éxitosamente",
  "data": {
    "id": 1,
    "symptoms_id": 2,
    "consultation_id": 10,
    "severity": "moderado",
    "duration": "2 días",
    "notes": "Empeora en la tarde",
    "created_at": "2026-03-23T10:05:00.000Z",
    "symptom": { "id": 2, "name": "Dolor" }
  }
}
```

### ClinicalExaminations

Base: `/:id/clinical-examinations`

- GET `/`
- POST `/`
  - Body: debe enviar al menos 1 campo:
    - `weight?` (number > 0)
    - `height?` (number > 0)
    - `temperature?` (number > 0)
    - `systolic_bp?` (int > 0)
    - `diastolic_bp?` (int > 0)
    - `heart_rate?` (int > 0)
    - `respiratory_rate?` (int > 0)
    - `oxygen_saturation?` (number > 0)
- PUT `/:clinicalExaminationId`
  - Params:
    - `clinicalExaminationId` (int > 0, debe pertenecer a la consulta)
- DELETE `/:clinicalExaminationId`

Response (201, POST) (ejemplo):

```json
{
  "message": "Examen clínico creado éxitosamente",
  "data": {
    "id": 1,
    "consultation_id": 10,
    "weight": "70.50",
    "height": "1.72",
    "temperature": "36.70",
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "heart_rate": 75,
    "respiratory_rate": 16,
    "oxygen_saturation": "98.00",
    "created_at": "2026-03-23T10:10:00.000Z"
  }
}
```

### ConsultationDiagnoses

Base: `/:id/consultation-diagnoses`

- GET `/`
- POST `/`
  - Body:
    - `diagnosisId` (int > 0, debe existir)
    - `is_primary` (boolean)
    - `condition_status?` (string 1..50)
    - `onset_date?` (string ISO)
  - Regla: solo 1 diagnóstico primario (`is_primary=true`) por consulta.
- PUT `/:consultationDiagnosisId`
  - Params:
    - `consultationDiagnosisId` (int > 0, debe pertenecer a la consulta)
- DELETE `/:consultationDiagnosisId`

Response (201, POST) (ejemplo):

```json
{
  "message": "Diagnóstico agregado a la consulta éxitosamente",
  "data": {
    "id": 1,
    "consultation_id": 10,
    "diagnosisId": 1,
    "is_primary": true,
    "condition_status": "agudo",
    "onset_date": "2026-03-23T00:00:00.000Z",
    "created_at": "2026-03-23T10:15:00.000Z",
    "diagnosis": { "id": 1, "code": "A00", "description": "Cólera", "category": "Infecciosas" }
  }
}
```

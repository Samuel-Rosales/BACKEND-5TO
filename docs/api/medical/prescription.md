# Prescripciones

Base URL: `/api/v1/medical/prescription`

## POST `/`

Body:

- `consultationId` (int > 0, **requerido**, debe existir)
- `productId?` (int > 0, producto debe existir y estar activo)
- `medication_name?` (string, 1..150)
- `dosage?` (string, 1..100)
- `frequency?` (string, 1..100)
- `duration?` (string, 1..100)
- `instructions?` (string, 1..5000)

Regla: enviar **al menos uno**: `productId` o `medication_name`.

Request (JSON) (por producto):

```json
{
  "consultationId": 10,
  "productId": 1,
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
    "productId": 1,
    "medication_name": null,
    "dosage": "500mg",
    "frequency": "Cada 8h",
    "duration": "3 días",
    "instructions": "Tomar después de comer",
    "product": { "id": 1, "name": "Paracetamol", "sku": "PARA-500" }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.
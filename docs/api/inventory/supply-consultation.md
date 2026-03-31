# Insumos por consulta

Base URL: `/api/v1/inventory/supply-consultation`

## POST `/`

Body:

- `supplyId` (int, **requerido**, debe existir y estar activo)
- `consultationId` (int, **requerido**, debe existir)
- `quantity` (number, **requerido**, > 0)

Request (JSON):

```json
{ "supplyId": 1, "consultationId": 10, "quantity": 2 }
```

Response (201) (ejemplo, resumen):

```json
{
  "message": "Suministro creado éxitosamente",
  "data": {
    "id": 1,
    "supplyId": 1,
    "consultationId": 10,
    "quantity": "2",
    "supply": { "id": 1, "name": "Paracetamol", "sku": "PARA-500", "active": true },
    "consultation": { "id": 10, "patientId": 4, "doctorId": 3, "date": "2026-03-23T10:00:00.000Z", "started_at": null, "finished_at": null }
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

PUT body: mismos campos que POST pero opcionales.

DELETE es hard delete.
# Insumos por consulta

Base URL: `/api/v1/inventory/supply-consultation`

## Modelo (Prisma: `SupplyConsultation`)

- `id` (Int, autoincrement)
- `supplyId` (Int, requerido) → FK a `Supply.id`
- `consultationId` (Int, requerido) → FK a `Consultation.id`
- `quantity` (Decimal)

Relaciones:

- `SupplyConsultation.supplyId -> Supply.id`
- `SupplyConsultation.consultationId -> Consultation.id`

Notas:

- `quantity` es `Decimal`: en respuestas normalmente llega como **string**.
- Este recurso registra el consumo/uso de un insumo durante una consulta.

## POST `/`

Qué hace:

- Crea un registro de insumo usado en una consulta.

Cómo usarlo (pasos):

1) Verifica que exista el `consultationId`.
2) Verifica que exista el `supplyId` y esté activo.
3) Define `quantity` (> 0).
4) Envía el JSON.

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

Qué hacen:

- `GET /`: lista registros.
- `GET /:id`: devuelve un registro.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina el registro (borrado físico).

PUT body: mismos campos que POST pero opcionales.

DELETE es hard delete.
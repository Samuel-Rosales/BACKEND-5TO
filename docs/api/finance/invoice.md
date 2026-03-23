# Facturas

Base URL: `/api/v1/finance/invoice`

## POST `/`

Body:

- `consultationId` (int > 0, **requerido**, debe existir y no puede tener ya una factura)
- `exchangeRateId?` (int > 0, debe existir; si no se envía se usa la tasa activa)
- `statusId?` (int > 0, debe existir; si no se envía intenta `"Proforma"` o el primer status)
- `details?` (array) → si no se envía, se autogenera desde la consulta (consulta + insumos)

Request (JSON) (sin `details` → autogenera):

```json
{
  "consultationId": 10
}
```

Request (JSON) (con `details`):

```json
{
  "consultationId": 10,
  "exchangeRateId": 1,
  "statusId": 1,
  "details": [
    {
      "description": "Consulta",
      "quantity": 1,
      "unit_price": 50,
      "taxId": 1,
      "is_commissionable": true
    },
    {
      "productId": 2,
      "description": "Insumo - Guantes (x2)",
      "quantity": 1,
      "unit_price": 3,
      "taxId": 1,
      "is_commissionable": false
    }
  ]
}
```

Response (201) (resumen):

```json
{
  "message": "Factura creada éxitosamente",
  "data": {
    "id": 1,
    "consultationId": 10,
    "exchangeRateId": 1,
    "total_usd": 53,
    "total_bs": 2040.5,
    "statusId": 1,
    "status": { "id": 1, "name": "Proforma", "color_hex": "#3B82F6" },
    "exchangeRate": { "id": 1, "rate": "38.5", "createdAt": "2026-03-23T12:00:00.000Z", "is_active": true },
    "consultation": {
      "id": 10,
      "appointmentId": null,
      "date": "2026-03-23T10:00:00.000Z",
      "started_at": null,
      "finished_at": null,
      "patient": { "id": 4, "user": { "id": 21, "ci": "V-123", "name": "Paciente" } },
      "doctor": {
        "id": 3,
        "user": { "id": 12, "ci": "V-456", "name": "Doctor" },
        "specialty": { "id": 1, "name": "Medicina", "consultation_price": "50", "commission_percentage": "30" }
      },
      "supplies": []
    },
    "details": [],
    "payments": [],
    "commissions": {
      "clinic_percent": 30,
      "doctor_percent": 70,
      "base_commissionable_usd": 50,
      "clinic_amount_usd": 15,
      "doctor_amount_usd": 35
    }
  }
}
```

## GET `/`

Respuesta `data`: `Invoice[]` (el listado no agrega `commissions`).

## GET `/:id`

- Si no existe: `404` con `data: null`.
- Si existe: retorna `Invoice` + `commissions`.

Response (404):

```json
{
  "message": "Factura no encontrada",
  "data": null
}
```

## PUT `/:id`

Body:

- `exchangeRateId?` (int > 0)
- `statusId?` (int > 0)

Request (JSON):

```json
{
  "exchangeRateId": 2,
  "statusId": 3
}
```

Response (200) (ejemplo, incluye `commissions`):

```json
{
  "message": "Factura actualizada éxitosamente",
  "data": {
    "id": 1,
    "consultationId": 10,
    "exchangeRateId": 2,
    "total_usd": 53,
    "total_bs": 2120.0,
    "statusId": 3,
    "commissions": {
      "clinic_percent": 30,
      "doctor_percent": 70,
      "base_commissionable_usd": 50,
      "clinic_amount_usd": 15,
      "doctor_amount_usd": 35
    }
  }
}
```

- Si no existe: `404` con `data: null`.

## DELETE `/:id`

Borra en transacción pagos + detalles + la factura.
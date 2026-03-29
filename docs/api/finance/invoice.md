# Facturas

Base URL: `/api/v1/finance/invoice`

## POST `/`

Body:

- `patientId` (int > 0, **requerido**, debe existir)
- `receptionistId` (int > 0, **requerido**, debe existir)
- `appointmentId?` (int > 0, debe existir y pertenecer al `patientId`) → si se envía, el backend calcula `total_usd` desde la especialidad del doctor y también calcula `commissions`.
- `total_usd?` (number > 0) → si **no** se envía `appointmentId`, entonces **debe** enviarse `total_usd`.
- `exchangeRateId?` (int > 0, debe existir; si no se envía se usa la tasa activa)
- `statusId?` (int > 0, debe existir; si no se envía intenta `"Proforma"` o el primer status)
- `taxId?` (int > 0, debe existir; si no se envía usa el primer impuesto activo)

Notas:

- `appointmentId` **no** se persiste en la tabla `Invoice` (solo se usa para el cálculo al crear).
- `details` no aplica para facturas actualmente: si se envía, **se valida** (estructura/campos) pero luego se **ignora** en la creación.

Request (JSON) (creación desde cita):

```json
{
  "patientId": 4,
  "receptionistId": 21,
  "appointmentId": 10
}
```

Request (JSON) (creación manual con `total_usd`):

```json
{
  "patientId": 4,
  "receptionistId": 21,
  "total_usd": 53
}
```

Response (201) (resumen):

```json
{
  "message": "Factura creada éxitosamente",
  "data": {
    "id": 1,
    "patientId": 4,
    "receptionistId": 21,
    "exchangeRateId": 1,
    "statusId": 1,
    "taxId": 1,
    "total_usd": "53.00",
    "status": { "id": 1, "name": "Proforma", "color_hex": "#3B82F6" },
    "exchangeRate": { "id": 1, "rate": "38.5", "createdAt": "2026-03-23T12:00:00.000Z", "is_active": true },
    "tax": { "id": 1, "name": "IVA", "rate": "16", "code": "IVA", "isActive": true },
    "patient": { "id": 4, "user": { "id": 21, "ci": "30000000", "name": "Paciente" } },
    "receptionist": { "id": 21, "ci": "30000000", "name": "Recepcionista" },
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

Respuesta `data`: `Invoice[]`.

Notas:

- El listado **no** agrega `commissions`.
- Incluye `payments` (pagos asociados) con su `paymentMethod` y `exchangeRate`.

## GET `/:id`

**No habilitado actualmente**.

Este endpoint está documentado por referencia histórica, pero hoy no está montado en Express (la ruta está comentada). Si intentas consumirlo el servidor responderá `404 Not Found`.


Cuando se habilite, debería retornar `Invoice` + `commissions`.

## PUT `/:id`

**No habilitado actualmente**.

Este endpoint está documentado por referencia histórica, pero hoy no está montado en Express (la ruta está comentada). Si intentas consumirlo el servidor responderá `404 Not Found`.

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

Cuando se habilite, debería actualizar el `exchangeRateId` y/o `statusId` de la factura.

## DELETE `/:id`

**No habilitado actualmente**.

Este endpoint está documentado por referencia histórica, pero hoy no está montado en Express (la ruta está comentada). Si intentas consumirlo el servidor responderá `404 Not Found`.

Cuando se habilite, debería eliminar la factura y sus pagos asociados.
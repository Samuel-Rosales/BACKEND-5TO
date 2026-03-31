# Facturas

Base URL: `/api/v1/finance/invoice`

## Modelo (Prisma: `Invoice`)

Campos persistidos en BD según `schema.prisma`:

- `id` (Int, autoincrement)
- `patientId` (Int, requerido) → FK a `Patient.id`
- `receptionistId` (Int, requerido) → FK a `User.id`
- `exchangeRateId` (Int, **requerido en BD**) → FK a `ExchangeRate.id`
- `statusId` (Int, **requerido en BD**) → FK a `StatusInvoice.id`
- `taxId` (Int, **requerido en BD**) → FK a `Tax.id`
- `total_usd` (Decimal, requerido)

Relaciones:

- `Invoice (1) -> (N) InvoicePayment`
- `Invoice (1) -> (1) Consultation` (opcional)

Notas:

- `total_usd` es `Decimal`: en respuestas normalmente llega como **string**.
- Campos como `appointmentId`, `commissions` o `details` pueden existir en la API como entrada/salida **calculada**, pero no son columnas del modelo `Invoice`.

## POST `/`

Qué hace:

- Crea una factura (`Invoice`).

Cómo usarlo (pasos):

1) Define `patientId`.
2) Define `receptionistId`.
3) Define `taxId`, `statusId` y `exchangeRateId` (son requeridos en BD). Si tu backend aplica defaults automáticos, puedes omitirlos solo si la API lo permite.
4) Define `total_usd` o envía un `appointmentId` si tu backend calcula el total.
5) Envía el JSON.

Body:

- `patientId` (int > 0, **requerido**, debe existir)
- `receptionistId` (int > 0, **requerido**, debe existir)
- `appointmentId?` (int > 0, debe existir y pertenecer al `patientId`) → si se envía, el backend calcula `total_usd` desde la especialidad del doctor y también calcula `commissions`.
- `total_usd?` (number > 0) → si **no** se envía `appointmentId`, entonces **debe** enviarse `total_usd`.
- `exchangeRateId?` (int > 0; **en BD es requerido**; si no se envía, el backend puede usar la tasa activa)
- `statusId?` (int > 0; **en BD es requerido**; si no se envía, el backend puede usar un status por defecto)
- `taxId?` (int > 0; **en BD es requerido**; si no se envía, el backend puede usar el impuesto activo)

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

Qué hace:

- Lista facturas.

Cómo usarlo:

- Útil para panel administrativo; normalmente incluye relaciones básicas y pagos.

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
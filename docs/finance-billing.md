# Finanzas y Facturación (Backend)

Este documento describe el flujo funcional y los endpoints del **módulo de finanzas** y la **facturación automática al finalizar una consulta**, según el PDF de requerimientos.

## 1) Flujo funcional (lo que pasa en el sistema)

### 1.1 Crear consulta (inicio)
- Una consulta puede crearse **sin** estar finalizada.
- `started_at` se registra automáticamente con el momento de creación (default en DB: `now()`).
- `finished_at` queda **null** hasta que el doctor finaliza la consulta.

**Endpoint**
- `POST /api/v1/medical/consultation`

**Notas**
- Si el frontend envía `started_at`, el backend lo respeta (si es ISO válido).
- Si no lo envía, DB lo completa automáticamente.

### 1.2 Registrar insumos usados durante la consulta
Los insumos/consumos que deben entrar en la factura se registran mediante el módulo de inventario:

**Endpoint**
- `POST /api/v1/inventory/supply-consultation`

En la factura automática, estos insumos se leen desde `Consultation.supplies`.

### 1.3 Finalizar consulta (cierre) → genera factura automáticamente (estricto)
Al marcar una consulta como finalizada (primer set de `finished_at`), el backend:
1) Actualiza la consulta.
2) Genera automáticamente una **Factura** (por defecto tipo/estado Proforma) con:
   - Línea de consulta: precio por especialidad (`MedicalSpecialty.consultation_price`).
   - Líneas de insumos: productos usados en `SupplyConsultation`.
   - Impuesto por defecto: primer `Tax` activo.
   - Tasa por defecto: `ExchangeRate` activa.

**Endpoint**
- `PUT /api/v1/medical/consultation/:id` con `finished_at`

**Modo estricto (importante)**
- La finalización es **atómica**: si falla la creación de la factura (por falta de tasa activa, impuesto activo, status de factura, etc.), la consulta **NO** queda marcada como finalizada.

## 2) Reglas de cálculo (factura automática)

### 2.1 Totales
- El sistema toma USD como base (`total_usd`).
- `total_bs = total_usd * exchangeRate.rate`.

### 2.2 Detalles automáticos
Si no se envían `details` al crear una factura manualmente, se generan:
- **Consulta**
  - `description`: `Consulta - {specialty.name}`
  - `quantity`: 1
  - `unit_price`: `MedicalSpecialty.consultation_price`
  - `is_commissionable`: `true`

- **Insumos** (por cada registro en SupplyConsultation)
  - `description`: `Insumo - {product.name} (x{quantity})`
  - `quantity`: 1
  - `unit_price`: `product.cost_price * supply.quantity`
  - `is_commissionable`: `false`

> Nota: se usa `quantity=1` para evitar problemas de decimales en `InvoiceDetail.quantity` (que es `Int`).

### 2.3 Honorarios / comisiones
Se calcula un resumen de comisiones sobre los items marcados `is_commissionable=true`.
- `clinic_percent` = `MedicalSpecialty.commission_percentage` (porcentaje para la clínica)
- `doctor_percent` = `100 - clinic_percent`
- Los montos se calculan sobre el subtotal commissionable.

## 3) IGTF (pagos)

En pagos de factura (`InvoicePayment`), se calcula `igtf_amount` con una regla mínima:
- `IGTF_RATE = 0.03` (3%)
- Aplica **solo** si el método de pago parece ser **divisa + efectivo** (heurística por `PaymentMethod.type` y `PaymentMethod.currency`).

## 4) Endpoints del módulo Finance

Base: `/api/v1/finance/*`

### 4.1 Exchange Rate
- `POST /finance/exchange-rate`
- `GET /finance/exchange-rate`
- `GET /finance/exchange-rate/:id`
- `PUT /finance/exchange-rate/:id`
- `DELETE /finance/exchange-rate/:id`

Regla:
- Si se crea/actualiza con `is_active=true`, se desactivan las demás tasas activas.

**Ejemplo (crear)**
```bash
curl -X POST http://localhost:3000/api/v1/finance/exchange-rate \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 38.5,
    "is_active": true
  }'
```

### 4.2 Tax
- `POST /finance/tax`
- `GET /finance/tax`
- `GET /finance/tax/:id`
- `PUT /finance/tax/:id`
- `DELETE /finance/tax/:id`

Campos típicos:
- `name` (ej: IVA)
- `rate` (ej: 16)
- `code` (ej: IVA)
- `isActive` (boolean)

### 4.3 Payment Method
- `POST /finance/payment-method`
- `GET /finance/payment-method`
- `GET /finance/payment-method/:id`
- `PUT /finance/payment-method/:id`
- `DELETE /finance/payment-method/:id`

Campos:
- `name` (ej: Efectivo USD)
- `type` (ej: Efectivo, Transferencia)
- `currency` (ej: USD, VES)
- `is_active` (boolean)

### 4.4 Status Invoice
- `POST /finance/status-invoice`
- `GET /finance/status-invoice`
- `GET /finance/status-invoice/:id`
- `PUT /finance/status-invoice/:id`
- `DELETE /finance/status-invoice/:id`

Se recomienda tener al menos:
- `Proforma`

### 4.5 Invoice
- `POST /finance/invoice`
- `GET /finance/invoice`
- `GET /finance/invoice/:id`
- `PUT /finance/invoice/:id`
- `DELETE /finance/invoice/:id`

**Crear (manual o automático)**
- Requerido: `consultationId`
- Opcional: `exchangeRateId`, `statusId`
- Opcional: `details[]`

Si no envías `details`, se auto-generan como se explicó en 2.2.

**Ejemplo (crear manual sin details, auto-generación)**
```bash
curl -X POST http://localhost:3000/api/v1/finance/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "consultationId": 10
  }'
```

### 4.6 Invoice Payment
- `POST /finance/invoice-payment`
- `GET /finance/invoice-payment`
- `GET /finance/invoice-payment/:id`
- `PUT /finance/invoice-payment/:id`
- `DELETE /finance/invoice-payment/:id`

**Ejemplo (pago)**
```bash
curl -X POST http://localhost:3000/api/v1/finance/invoice-payment \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": 1,
    "paymentMethodId": 1,
    "currencyId": 1,
    "amount_paid": 100
  }'
```

## 5) Pre-requisitos (para que el flujo no falle)

Para que la facturación automática funcione, deben existir:
- Al menos 1 `ExchangeRate` activa.
- Al menos 1 `Tax` activo.
- Al menos 1 `StatusInvoice` (idealmente `Proforma`).

### 5.1 Seed recomendado
Se incluyó un seed modular para crear:
- StatusInvoice: Proforma, Pagada, Anulada
- Tax: IVA (16%)
- ExchangeRate activa (rate=500) y una histórica (rate=475)
- PaymentMethod: Efectivo USD, Transferencia Bs, Zelle USD, Pago móvil VES

Ejecutar:
```bash
npm run prisma:seed
```

## 6) Cómo probar el flujo completo (checklist)

1) Crear tasa activa, impuesto activo y status Proforma (o correr seed).
2) Crear consulta (sin finished_at).
3) Crear supply-consultation asociado a esa consulta.
4) Finalizar consulta con `PUT` seteando `finished_at`.
5) Verificar que se creó `Invoice` con detalles automáticos.

## 7) Notas importantes
- La finalización de consulta depende de `Consultation.finished_at` (no del status de la cita/appointment).
- La finalización es estricta: si falla la factura, no se finaliza.
- Los cálculos se redondean a 2 decimales en resultados.

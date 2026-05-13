# 4) Flujo crítico: Finalizar consulta ⇒ Genera factura automáticamente (modo estricto)

## 4.1 Definición de "finalizar consulta"
Una consulta se considera finalizada cuando se setea `Consultation.finished_at` por primera vez.
- `started_at` tiene default `now()`
- `finished_at` es nullable hasta finalizar

## 4.2 Qué hace el backend al finalizar (estricto)
Al hacer `PUT /medical/consultation/:id` con `finished_at`:
1. Actualiza la consulta.
2. Si antes no estaba finalizada y ahora sí lo está:
   - Si no existe `Invoice` para esa `consultationId`, crea una factura automáticamente.

**Estricto = atómico**
- Todo corre en **una transacción**.
- Si falla la creación de la factura, el update de la consulta falla y la consulta **NO** queda finalizada.

## 4.3 Pre-requisitos
- Debe existir al menos una `ExchangeRate` activa.
- Debe existir al menos un `Tax` activo (`isActive=true`).
- Debe existir al menos un `StatusInvoice` (ideal `Proforma`).

> Con el seed (`npm run prisma:seed`) queda cubierto.

## 4.4 Cómo testear el flujo (checklist)

**A) Preparación de datos (mínimo)**
- Tener:
  - 1 `MedicalSpecialty` (con `consultation_price` y `commission_percentage`)
  - 1 `Doctor` ligado a un `User` y a `MedicalSpecialty`
  - 1 `Patient` (opcionalmente ligado a `User`)

**B) Crear consulta (sin finished_at)**
- `POST /api/v1/medical/consultation`

**C) (Opcional) Agregar insumos consumidos**
- Crear productos/inventario, luego:
- `POST /api/v1/inventory/supply-consultation`

**D) Finalizar consulta**
- `PUT /api/v1/medical/consultation/:id` con `finished_at` en formato ISO.

Ejemplo:
```bash
curl -X PUT http://localhost:3000/api/v1/medical/consultation/1 \
  -H "Content-Type: application/json" \
  -d '{
    "finished_at": "2026-03-21T10:30:00.000Z"
  }'
```

**E) Verificación**
- Debe existir una `Invoice` con `consultationId` igual a la consulta.
- Debe traer `details` auto-generados:
  - Línea de consulta (commissionable)
  - Líneas de insumos (si existen supplies)

## 4.5 Receta completa (crear datos desde cero)

> Sugerencia: usa Postman/Insomnia y guarda los IDs que devuelve cada `POST`.

**Paso 1: crear 1 rol**
`POST /api/v1/auth/role`
```bash
curl -X POST http://localhost:3000/api/v1/auth/role \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Doctor",
    "code": "DOCTOR"
  }'
```

**Paso 2: crear 1 usuario (para el doctor)**
`POST /api/v1/auth/user`
```bash
curl -X POST http://localhost:3000/api/v1/auth/user \
  -H "Content-Type: application/json" \
  -d '{
    "ci": "10000001",
    "name": "Dr Demo",
    "password": "123456",
    "roleId": 1
  }'
```

**Paso 3: crear 1 especialidad (define el precio de consulta)**
`POST /api/v1/medical/specialty`
```bash
curl -X POST http://localhost:3000/api/v1/medical/specialty \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Medicina General",
    "consultation_price": 20,
    "commission_percentage": 30
  }'
```

**Paso 4: crear 1 doctor**
`POST /api/v1/medical/doctor`
```bash
curl -X POST http://localhost:3000/api/v1/medical/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "specialtyId": 1
  }'
```

**Paso 5: crear 1 paciente (puede ser sin user)**
`POST /api/v1/medical/patient`
```bash
curl -X POST http://localhost:3000/api/v1/medical/patient \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_sangre": "O+"
  }'
```

**Paso 6: (opcional pero recomendado) preparar inventario para insumos**

Crear categoría:
```bash
curl -X POST http://localhost:3000/api/v1/inventory/category \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Insumos"
  }'
```

Crear unidad de medida:
```bash
curl -X POST http://localhost:3000/api/v1/inventory/measurement-unit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unidad",
    "symbol": "u"
  }'
```

Crear producto:
```bash
curl -X POST http://localhost:3000/api/v1/inventory/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Guantes",
    "cost_price": 1.25,
    "categoryId": 1,
    "unitId": 1,
    "active": true
  }'
```

**Paso 7: crear consulta**
`POST /api/v1/medical/consultation`
```bash
curl -X POST http://localhost:3000/api/v1/medical/consultation \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "symptoms": "Dolor de cabeza"
  }'
```

**Paso 8: asociar insumo a la consulta**
`POST /api/v1/inventory/supply-consultation`
```bash
curl -X POST http://localhost:3000/api/v1/inventory/supply-consultation \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "consultationId": 1,
    "quantity": 2
  }'
```

**Paso 9: finalizar consulta (esto debe crear la factura)**
```bash
curl -X PUT http://localhost:3000/api/v1/medical/consultation/<CONSULTATION_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "finished_at": "2026-03-21T10:30:00.000Z"
  }'
```

**Paso 10: verificar facturas**
`GET /api/v1/finance/invoice`
```bash
curl http://localhost:3000/api/v1/finance/invoice
```

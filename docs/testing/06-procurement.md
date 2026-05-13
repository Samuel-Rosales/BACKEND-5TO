# 6) Procurement (compras y actualización de stock por lotes)

## 6.1 Decisión: sin créditos
Para compras **no** se maneja crédito:
- Se eliminaron campos de saldo/estado de pago/vencimiento.
- Los pagos de compra existen solo como registro (no recalculan balances).

## 6.2 Crear proveedor
Base: `/api/v1/procurement/supplier`

Ejemplo:
```bash
curl -X POST http://localhost:3000/api/v1/procurement/supplier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Proveedor Demo",
    "contact": "Juan",
    "phone": "0414-0000000"
  }'
```

## 6.3 Crear compra (esto actualiza stock automáticamente)
Base: `/api/v1/procurement/purchase`

**Cómo obtener `exchangeRateId`**
- Si corriste el seed (`npm run prisma:seed`), ya existe al menos 1 tasa activa.
- Obtén el ID con:
  - `GET /api/v1/finance/exchange-rate`

**Request requerido**
- `supplierId` (existente)
- `userId` (existente)
- `exchangeRateId` (existente)
- `items[]` con:
  - `productId` (existente y activo)
  - `quantity` (int > 0)
  - `unit_cost` (number > 0)
  - `expiration_date` (ISO, opcional)

Ejemplo:
```bash
curl -X POST http://localhost:3000/api/v1/procurement/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "userId": 1,
    "exchangeRateId": 1,
    "reference": "FAC-001",
    "observation": "Compra de prueba",
    "discount": 0,
    "items": [
      {"productId": 1, "quantity": 10, "unit_cost": 2.50, "expiration_date": "2026-12-31"},
      {"productId": 2, "quantity": 5,  "unit_cost": 1.10}
    ]
  }'
```

**Qué sucede en DB (en transacción)**
Por cada item:
- Se crea un `StockLot` (lote) con `quantity`, `lot_cost`, `expiration_date`.
- Se crea un `StockMovement` con:
  - `type = "IN"`
  - `reason = "PURCHASE:{purchaseId}"`
  - `quantity = item.quantity`

## 6.4 Cómo verificar stock por lotes
- Consultar lotes: `GET /api/v1/inventory/stock-lot`
- Consultar movimientos: `GET /api/v1/inventory/stock-movement`

Sugerencia: filtrar por `reason` desde DB o inspeccionando la respuesta (la API devuelve `reason`).

## 6.5 Eliminar compra (regla de seguridad)
`DELETE /api/v1/procurement/purchase/:id`

Regla:
- La compra se puede eliminar si los lotes/movimientos creados por esa compra **no** tienen otros movimientos asociados.
- Si detecta otros movimientos en esos lotes, retorna `400` y no elimina.

## 6.6 Registrar pago de compra
Base: `/api/v1/procurement/purchase-payment`

Ejemplo:
```bash
curl -X POST http://localhost:3000/api/v1/procurement/purchase-payment \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": 1,
    "paymentMethodId": 1,
    "amount": 25.00,
    "currency": "USD",
    "reference": "REF-XYZ",
    "payment_date": "2026-03-21"
  }'
```

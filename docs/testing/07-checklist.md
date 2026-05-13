# 7) Checklist de regresión rápida (para equipo)

## 7.1 Salud del API
- `GET /health` ⇒ OK

## 7.2 Facturación automática (estricto)
- Seed ejecutado
- Crear consulta
- Finalizar consulta con `finished_at`
- Verificar `Invoice` creada y con `details`

## 7.3 IGTF
- `PaymentMethod` efectivo USD
- Registrar `invoice-payment`
- Verificar `igtf_amount`

## 7.4 Compras ⇒ Stock por lotes
- Crear proveedor
- Crear compra con items
- Verificar:
  - `StockLot` creado por item
  - `StockMovement IN` por lote con `reason=PURCHASE:{id}`

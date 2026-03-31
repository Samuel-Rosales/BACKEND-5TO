# Inventory

Base URL: `/api/v1/inventory`

Este módulo documenta el **modelo de Inventario** definido en `prisma/schema.prisma`.

## Modelos (Prisma)

- `Supply` (insumo) → `active` para soft delete
- `SupplyPresentation` (presentación) → `isActive` para soft delete
- `Category` (categoría) → `active` para soft delete
- `MeasurementUnit` (unidad) → `active` para soft delete
- `StockLot` (lote) → enlaza a `Supply`
- `StockMovement` (movimiento) → enlaza a `Supply`, `StockLot`, `User`
- `SupplyConsultation` (uso en consulta) → enlaza a `Supply` y `Consultation`

Notas:

- Los campos `Decimal` del schema (p.ej. `cost_price`, `lot_cost`, `factor`, `price`) normalmente se serializan como **string** en JSON.
- Los deletes en modelos con `active/isActive` deberían interpretarse como **soft delete** (desactivar). Si una implementación hace borrado físico, el registro se perderá.

Notas:

- En la mayoría de recursos, los endpoints `GET /:id`, `PUT /:id`, `DELETE /:id` validan que el ID exista mediante `express-validator`. Si el ID no existe, la API responde **400** con el formato de error de validación (ver [docs/api/README.md](../README.md)).

## Recursos

- [Categorías](category.md)
- [Unidades de medida](measurement-unit.md)
- [Insumos](supply.md)
- [Lotes de stock](stock-lot.md)
- [Movimientos de stock](stock-movement.md)
- [Insumos por consulta](supply-consultation.md)
- [Presentaciones de insumos](supply-presentation.md)

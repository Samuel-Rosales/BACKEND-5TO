# 3) Seed recomendado (data demo + pre-requisitos)

Existe un seed en `prisma/seed.ts`.

Ejecutar:
```bash
npm run prisma:seed
```

## 3.1 Qué crea (si no existe)

**Finanzas (pre-requisitos de facturación)**
- `StatusInvoice`: `Proforma`
- `Tax`: `IVA` con `rate=16`
- `ExchangeRate`: activa (`is_active=true`) con `rate=1` (placeholder)
- `PaymentMethod`: `Efectivo USD`, `Transferencia Bs`

**Data demo (para probar flujos end-to-end)**
- Roles: `ADMIN`, `DOCTOR`, `RECEPTION`, `PATIENT`
- Usuarios demo (password: `123456`)
- Especialidades médicas
- Doctores y pacientes
- Inventario: categorías, unidad de medida, 3 productos
- Procurement: 2 proveedores y 2 compras demo
  - Cada compra crea `StockLot` + `StockMovement (IN)` por item
- 1 consulta demo **sin finalizar** (para que el equipo la finalice y genere factura)

El seed imprime un resumen de IDs en consola para que el equipo tenga referencias rápidas.

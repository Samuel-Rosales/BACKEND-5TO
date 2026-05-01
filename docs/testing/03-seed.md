# 3) Seed recomendado (data demo + pre-requisitos)

Existe un seed modular en `prisma/seed.ts` que delega en `prisma/seed/` por dominio.

Ejecutar:
```bash
npm run prisma:seed
```

## 3.1 Qué crea (si no existe)

**Finanzas (pre-requisitos de facturación)**
- `StatusInvoice`: `Proforma`, `Pagada`, `Anulada`
- `Tax`: `IVA` con `rate=16`
- `ExchangeRate`: activa (`is_active=true`) con `rate=500` y una histórica (`rate=475`)
- `PaymentMethod`: `Efectivo USD`, `Transferencia Bs`, `Zelle USD`, `Pago móvil VES`

**Data demo (para probar flujos end-to-end)**
- Roles: `ADMIN`, `DOCTOR`, `RECEPTION`, `PATIENT`
- Usuarios demo (password: `123456`)
- Especialidades médicas
- Doctores y pacientes
- Inventario: categorías, unidades de medida, 8 productos
- Scheduling: estados y tipos de cita
- Consultas demo con `Invoice`, `InvoicePayment`, `SupplyConsultation`, diagnósticos y prescripciones
- Procurement: 3 proveedores y 3 compras demo
  - Cada compra crea `StockLot` + `StockMovement (IN)` por item
- Gastos operativos (`InvoiceExpense` + `ExpensePayment`)
- Nómina (`Payroll` + `PayrollLine`) para consultas acumuladas

El seed imprime un resumen de IDs en consola para que el equipo tenga referencias rápidas.

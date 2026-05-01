# Módulo Reports: Libro de Egresos Consolidado (Expense Ledger)

Expone una vista unificada que consolida las compras de insumos (`PURCHASE`), los gastos operativos (`OPEX`), y la nómina (`PAYROLL`).

## Obtener consolidado
`GET /api/v1/reports/expense-ledger`

**Query Params:**
- `from` (string, **requerido**): Fecha de inicio, formato `YYYY-MM-DD`.
- `to` (string, **requerido**): Fecha de fin, formato `YYYY-MM-DD`.
- `source` (string, opcional): Origen del gasto. Valores permitidos: `PURCHASE`, `OPEX`, `PAYROLL`, `ALL`. Default: `ALL`.
- `status` (string, opcional): Estado del gasto (ej. `Paid`, `Pending`). Especialmente útil para nómina.
- `currencyView` (string, opcional): Moneda para mostrar. Valores permitidos: `USD`, `VES`. Default: `USD`.
- `page` (number, opcional): Página. Default: 1.
- `pageSize` (number, opcional): Resultados por página. Max: 100. Default: 20.
- `payrollMode` (string, opcional): Modo de nómina a calcular. Valores permitidos: `ACCRUED` (devengado), `PAID` (pagado). Default: `ACCRUED`. 
  - *Nota: Si se usa `PAID`, devolverá vacío y una advertencia (`warnings` en `meta`), ya que actualmente no existe una tabla de pagos de nómina (`PayrollPayment`).*

**Respuesta 200 (Ejemplo):**

```json
{
  "message": "Egresos consolidados encontrados exitosamente",
  "data": {
    "items": [
      {
        "id": "OPEX-15",
        "source": "OPEX",
        "sourceId": 15,
        "occurredAt": "2026-05-01T10:00:00.000Z",
        "description": "Pago de OPEX a Proveedor C.A.",
        "counterparty": "Proveedor C.A.",
        "category": "Alquiler",
        "status": "PAID",
        "paymentMethod": "Zelle",
        "currencyOriginal": "USD",
        "amountOriginal": 500,
        "exchangeRate": 36.5,
        "amountUsd": 500,
        "amountVes": 18250,
        "notes": null
      },
      {
        "id": "PAYROLL-42",
        "source": "PAYROLL",
        "sourceId": 42,
        "occurredAt": "2026-05-01T14:30:00.000Z",
        "description": "Nómina devengada: Dr. Juan Pérez (Consulta #12)",
        "counterparty": "Dr. Juan Pérez",
        "category": "Servicios Médicos",
        "status": "Pending",
        "paymentMethod": null,
        "currencyOriginal": "USD",
        "amountOriginal": 15,
        "exchangeRate": 36.5,
        "amountUsd": 15,
        "amountVes": 547.5,
        "notes": "Base: 50, Comisión: 30%"
      }
    ],
    "totals": {
      "totalUsd": 515,
      "totalVes": 18797.5,
      "bySource": {
        "PURCHASE": { "totalUsd": 0, "totalVes": 0 },
        "OPEX": { "totalUsd": 500, "totalVes": 18250 },
        "PAYROLL": { "totalUsd": 15, "totalVes": 547.5 }
      }
    },
    "meta": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 2,
      "totalPages": 1,
      "filtersApplied": {
        "from": "2026-05-01",
        "to": "2026-05-31",
        "source": "ALL",
        "currencyView": "USD",
        "payrollMode": "ACCRUED"
      }
    }
  }
}
```

**Errores comunes:**
- `400 Bad Request`: Validaciones en las fechas o enums inválidos.
- `500 Internal Server Error`: Problemas durante la consolidación en base de datos.

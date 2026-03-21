# 5) Finance (facturas y pagos)

Para detalles funcionales del módulo de finanzas (cálculos, endpoints, IGTF, etc.) ver también:
- `docs/finance-billing.md`

## 5.1 Crear factura manual (opcional)
- `POST /api/v1/finance/invoice`
- Si no envías `details`, el backend auto-genera a partir de la consulta.

Ejemplo:
```bash
curl -X POST http://localhost:3000/api/v1/finance/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "consultationId": 1
  }'
```

## 5.2 Pagos de factura e IGTF (3%)
- `POST /api/v1/finance/invoice-payment`

Regla mínima implementada:
- IGTF se aplica si el método parece **efectivo** + **divisa** (heurística por `PaymentMethod.type` y `PaymentMethod.currency`).
- `igtf_amount = amount_paid * 0.03` (redondeo a 2 decimales).

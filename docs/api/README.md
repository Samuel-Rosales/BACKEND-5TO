# API (v1)

Base URL: `http://localhost:3000/api/v1`

## Autenticación

Según el código actual, **la mayoría** de rutas no exigen token.

Cuando un endpoint está protegido por `authMiddleware`, debes enviar:

```
Authorization: Bearer <jwt>
```

Ejemplo de endpoint protegido: `GET /api/v1/auth/login/me`.

## Formato estándar de respuesta

En la mayoría de endpoints (controllers), la respuesta sigue este envelope:

```json
{
  "message": "string",
  "data": {},
  "error": "string | undefined"
}
```

Notas:

- Cuando el `service` retorna `data: null` (p.ej. 404 en Facturas/Pagos de factura), el controller responde igualmente con `{ message, data: null, error: undefined }`.

## Errores de validación (400)

Las validaciones usan `express-validator`. Si falla, el middleware responde:

```json
{
  "message": "<mensaje del primer error>",
  "errors": [
    {
      "type": "field",
      "value": "...",
      "msg": "...",
      "path": "campo",
      "location": "body|params|query"
    }
  ]
}
```

## 404 (ruta inexistente)

Si la URL no existe, el servidor responde:

```json
{
  "error": "Not Found",
  "requestedPath": "/api/v1/...",
  "validPrefix": "/api/v1"
}
```

## Tipos y serialización (importante)

- Fechas (`DateTime`) via JSON: string ISO (`"2026-03-22T12:34:56.000Z"`).
- Campos `Decimal` de Prisma (precios, tasas, montos): normalmente se serializan como **string** en JSON.

## Índice

- [Auth](auth/README.md)
- [Inventory](inventory/README.md)
- [Medical](medical/README.md)
- [Scheduling](scheduling/README.md)
- [Expenses](expenses/README.md)
- [Finance](finance/README.md)
- [Procurement](procurement/README.md)
- [Reports](reports/expense-ledger.md)
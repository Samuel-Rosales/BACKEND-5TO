# Status de factura

Base URL: `/api/v1/finance/status-invoice`

## Modelo (Prisma: `StatusInvoice`)

- `id` (Int, autoincrement)
- `name` (String)
- `color_hex` (String?)

Relación:

- `StatusInvoice (1) -> (N) Invoice`.

## POST `/`

Qué hace:

- Crea un status de factura (ej. Proforma, Pagada, Anulada).

Cómo usarlo (pasos):

1) Define `name`.
2) (Opcional) define `color_hex` para UI.
3) Envía el JSON.

Body:

- `name` (string, **requerido**, 2..80)
- `color_hex?` (string, 3..20)

Request (JSON):

```json
{
  "name": "Proforma",
  "color_hex": "#3B82F6"
}
```

Response (201):

```json
{
  "message": "Status de factura creado éxitosamente",
  "data": { "id": 1, "name": "Proforma", "color_hex": "#3B82F6" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista status.
- `GET /:id`: obtiene uno.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina (hard delete).

Nota: si el `:id` no existe, el backend responde `400` (error de validación con `express-validator`).

DELETE es hard delete.
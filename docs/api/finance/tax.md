# Impuestos

Base URL: `/api/v1/finance/tax`

## Modelo (Prisma: `Tax`)

- `id` (Int, autoincrement)
- `name` (String)
- `rate` (Decimal)
- `code` (String?)
- `isActive` (Boolean, default: `true`)

Relación:

- `Tax (1) -> (N) Invoice`.

Notas:

- `rate` es `Decimal`: en respuestas normalmente llega como **string**.
- `isActive` funciona como habilitar/deshabilitar el impuesto vigente.

## POST `/`

Qué hace:

- Crea un impuesto (por ejemplo IVA).

Cómo usarlo (pasos):

1) Define `name` (ej. IVA).
2) Define `rate` (0 < rate < 100).
3) (Opcional) Define `code`.
4) (Opcional) Define `isActive`.
5) Envía el JSON.

Body:

- `name` (string, **requerido**, 2..120)
- `rate` (number, **requerido**, 0 < rate < 100)
- `code?` (string, 1..60)
- `isActive?` (boolean)

Request (JSON):

```json
{
  "name": "IVA",
  "rate": 16,
  "code": "IVA",
  "isActive": true
}
```

Response (201):

```json
{
  "message": "Impuesto creado éxitosamente",
  "data": {
    "id": 1,
    "name": "IVA",
    "rate": "16",
    "code": "IVA",
    "isActive": true
  }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista impuestos.
- `GET /:id`: obtiene un impuesto.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina (hard delete).

Recomendación:

- En vez de borrar, normalmente se mantiene historial y se usa `isActive=false` para desactivar.

Nota: si el `:id` no existe, el backend responde `400` (error de validación con `express-validator`).

DELETE es hard delete.
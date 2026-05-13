# Categorías de gasto

Base URL: `/api/v1/expenses/category`

## Modelo (Prisma: `ExpenseCategory`)

- `id` (Int, autoincrement)
- `name` (String)

Relación:

- `ExpenseCategory (1) -> (N) InvoiceExpense`.

Notas:

- Este modelo no tiene `active` en el schema; el borrado suele ser **físico** (hard delete).

## POST `/`

Qué hace:

- Crea una categoría para clasificar gastos.

Cómo usarlo (pasos):

1) Define un `name` (ej. "Servicios").
2) Envía el JSON.

Body:

- `name` (string, **requerido**, 2..120)

Request (JSON):

```json
{ "name": "Servicios" }
```

Response (201):

```json
{
  "message": "Categoría de gasto creada éxitosamente",
  "data": { "id": 1, "name": "Servicios" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista categorías.
- `GET /:id`: obtiene detalle.
- `PUT /:id`: actualiza `name`.
- `DELETE /:id`: elimina (hard delete).

DELETE es hard delete.
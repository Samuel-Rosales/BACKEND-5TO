# Proveedores

Base URL: `/api/v1/procurement/supplier`

## Modelo (Prisma: `Supplier`)

- `id` (Int, autoincrement)
- `name` (String)
- `contact` (String?)
- `phone` (String?)

Relaciones:

- `Supplier (1) -> (N) Purchase`
- `Supplier (1) -> (N) InvoiceExpense`

Notas:

- Este modelo no tiene flag `active` en el schema, así que el borrado suele ser **físico** (hard delete), a menos que el backend implemente otra estrategia.

## POST `/`

Qué hace:

- Crea un proveedor.

Cómo usarlo (pasos):

1) Define `name`.
2) (Opcional) Define `contact` y `phone`.
3) Envía el JSON.

Body:

- `name` (string, **requerido**, 2..150)
- `contact?` (string, 1..150)
- `phone?` (string, 1..30)

Request (JSON):

```json
{
  "name": "Proveedor A",
  "contact": "María",
  "phone": "+58-000-0000"
}
```

Response (201):

```json
{
  "message": "Proveedor creado éxitosamente",
  "data": { "id": 1, "name": "Proveedor A", "contact": "María", "phone": "+58-000-0000" }
}
```

## GET `/` / GET `/:id` / PUT `/:id` / DELETE `/:id`

Qué hacen:

- `GET /`: lista proveedores.
- `GET /:id`: obtiene un proveedor.
- `PUT /:id`: actualiza campos.
- `DELETE /:id`: elimina el proveedor (hard delete).

Cómo usar `PUT`:

- Envía solo los campos que quieras cambiar.

Ejemplo PUT request:

```json
{ "phone": "+58-111-1111" }
```

DELETE es hard delete.
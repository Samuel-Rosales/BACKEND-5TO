# Categorías

Base URL: `/api/v1/inventory/category`

## Modelo (Prisma: `Category`)

- `id` (Int, autoincrement)
- `name` (String)
- `active` (Boolean, default: `true`) → soft delete

Relación:

- `Category (1) -> (N) Supply` por `Supply.categoryId`.

## POST `/`

Qué hace:

- Crea una categoría para clasificar insumos.

Cómo usarlo (pasos):

1) Define un `name` descriptivo (ej. "Medicamentos").
2) Envía el body. El backend asigna `id` y `active=true`.

Body:

- `name` (string, **requerido**, 2..120)

Request (JSON):

```json
{ "name": "Medicamentos" }
```

Response (201):

```json
{
  "message": "Categoría creada éxitosamente",
  "data": { "id": 1, "name": "Medicamentos", "active": true }
}
```

## GET `/`

Qué hace:

- Lista categorías.

Cómo usarlo:

- En catálogos/UI, normalmente filtras por `active: true`.

Response (200):

```json
{
  "message": "Categorías encontradas éxitosamente",
  "data": [
    { "id": 1, "name": "Medicamentos", "active": true }
  ]
}
```

## GET `/:id`

Qué hace:

- Devuelve una categoría por `id`.

Params:

- `id` (int > 0)

Response (200) (ejemplo):

```json
{
  "message": "Categoría encontrada éxitosamente",
  "data": { "id": 1, "name": "Medicamentos", "active": true }
}
```

## PUT `/:id`

Qué hace:

- Actualiza el nombre de la categoría.

Cómo usarlo:

1) Envía el nuevo `name`.
2) Úsalo cuando cambie la taxonomía (no afecta directamente stock, solo clasificación).

Body:

- `name` (string, 2..120)

Request (JSON):

```json
{ "name": "Insumos" }
```

Response (200):

```json
{
  "message": "Categoría actualizada éxitosamente",
  "data": { "id": 1, "name": "Insumos", "active": true }
}
```

## DELETE `/:id`

Qué hace:

- Según el modelo Prisma, el borrado recomendado es **soft delete** (`active=false`).

Cómo usarlo:

1) Elimina/desactiva una categoría cuando no quieras ofrecerla para nuevos insumos.
2) Si hay insumos que dependen de la categoría (`Supply.categoryId`), considera el impacto antes de desactivarla.

Soft delete: setea `active: false`.
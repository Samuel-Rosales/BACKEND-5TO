# Roles

Base URL: `/api/v1/auth/role`

## POST `/`

Body (JSON):

- `name` (string, **requerido**, 2..100, solo letras/números/espacios)
- `code` (string, **requerido**, 2..50)

Request (JSON):

```json
{
  "name": "Administrador",
  "code": "ADMIN"
}
```

Respuesta `data` (Role):

- `id` (number)
- `name` (string)
- `code` (string)
- `active` (boolean)

Response (201):

```json
{
  "message": "Rol creado éxitosamente",
  "data": { "id": 1, "name": "Administrador", "code": "ADMIN", "active": true }
}
```

## GET `/`

Devuelve solo roles con `active: true`.

Response (200):

```json
{
  "message": "Roles encontrados éxitosamente",
  "data": [
    { "id": 1, "name": "Administrador", "code": "ADMIN", "active": true }
  ]
}
```

## GET `/:id`

Params:

- `id` (int > 0, **requerido**)

Response (200) (ejemplo):

```json
{
  "message": "Rol encontrado éxitosamente",
  "data": { "id": 1, "name": "Administrador", "code": "ADMIN", "active": true }
}
```

## PUT `/:id`

Params:

- `id` (int > 0, **requerido**)

Body (JSON):

- `name` (string, 2..100)
- `code` (string, 2..50)

Request (JSON):

```json
{
  "name": "Admin",
  "code": "ADMIN"
}
```

Response (200):

```json
{
  "message": "Rol actualizado éxitosamente",
  "data": { "id": 1, "name": "Admin", "code": "ADMIN", "active": true }
}
```

## DELETE `/:id`

Soft delete: setea `active: false`.

Response (200):

```json
{
  "message": "Rol eliminado éxitosamente",
  "data": { "id": 1, "name": "Admin", "code": "ADMIN", "active": false }
}
```
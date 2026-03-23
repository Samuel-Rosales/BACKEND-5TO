# Usuarios

Base URL: `/api/v1/auth/user`

## POST `/`

Body (JSON):

- `ci` (string, **requerido**, 6..9, solo números)
- `name` (string, **requerido**, 2..100)
- `password` (string, **requerido**, 6..200)
- `roleId` (int > 0, **requerido**, debe existir y estar activo)

Request (JSON):

```json
{
  "ci": "12345678",
  "name": "Juan Pérez",
  "password": "123456",
  "roleId": 1
}
```

Response (201) (ejemplo):

```json
{
  "message": "Usuario creado éxitosamente",
  "data": {
    "id": 1,
    "ci": "12345678",
    "name": "Juan Pérez",
    "roleId": 1,
    "active": true,
    "role": { "id": 1, "name": "Admin", "code": "ADMIN" }
  }
}
```

## GET `/`

Devuelve solo usuarios con `active: true`.

Response (200):

```json
{
  "message": "Usuarios encontrados éxitosamente",
  "data": [
    {
      "id": 1,
      "ci": "12345678",
      "name": "Juan Pérez",
      "roleId": 1,
      "active": true,
      "role": { "id": 1, "name": "Admin", "code": "ADMIN" }
    }
  ]
}
```

## GET `/:id`

Params:

- `id` (int > 0, **requerido**)

Response (200) (ejemplo):

```json
{
  "message": "Usuario encontrado éxitosamente",
  "data": {
    "id": 1,
    "ci": "12345678",
    "name": "Juan Pérez",
    "roleId": 1,
    "active": true,
    "role": { "id": 1, "name": "Admin", "code": "ADMIN" }
  }
}
```

## PUT `/:id`

Params:

- `id` (int > 0, **requerido**)

Body (JSON):

- `ci` (string, 6..9, solo números)
- `name` (string, 2..100)
- `password` (string, 6..200) → se re-hashea.
- `roleId` (int > 0, debe existir y estar activo)

Request (JSON):

```json
{
  "name": "Juan P.",
  "password": "nueva-clave-123456"
}
```

Response (200):

```json
{
  "message": "Usuario actualizado éxitosamente",
  "data": {
    "id": 1,
    "ci": "12345678",
    "name": "Juan P.",
    "roleId": 1,
    "active": true,
    "role": { "id": 1, "name": "Admin", "code": "ADMIN" }
  }
}
```

## DELETE `/:id`

Soft delete: setea `active: false`.

Response (200):

```json
{
  "message": "Usuario eliminado éxitosamente",
  "data": {
    "id": 1,
    "ci": "12345678",
    "name": "Juan P.",
    "roleId": 1,
    "active": false,
    "role": { "id": 1, "name": "Admin", "code": "ADMIN" }
  }
}
```
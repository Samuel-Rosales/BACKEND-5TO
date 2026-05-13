# Login

Base URL: `/api/v1/auth/login`

Este recurso gestiona autenticación por credenciales (`ci` + `password`) y entrega un JWT.

## Signup / Registro

No existe un endpoint de registro público.

- Para crear usuarios se usa el recurso de [Usuarios](user.md) (`POST /api/v1/auth/user`).
- Flujo típico: crear usuario (admin) → login → usar token para endpoints protegidos.

## POST `/`

Qué hace:

- Inicia sesión con `ci` y `password`.
- Si las credenciales son válidas, retorna `{ user, token }`.

Validaciones (express-validator):

- `ci`: string numérico, 6..10 dígitos.
- `password`: string, mínimo 6 caracteres.

Body (JSON):

```json
{
  "ci": "12345678",
  "password": "123456"
}
```

Response (200):

> Nota: este endpoint no usa el envelope `{ message, data, error }` del resto de módulos; responde con `{ message, data }`.

```json
{
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "ci": "12345678",
      "name": "Juan Pérez",
      "roleId": 1,
      "active": true
    },
    "token": "<jwt>"
  }
}
```

Errores:

- `400`: error de validación (ver [docs/api/README.md](../README.md)).
- `401`: credenciales inválidas (`data: null`).
- `500`: error interno (`data: null`).

## GET `/me`

Qué hace:

- Devuelve el perfil del usuario autenticado por token.

Auth:

- Requiere header `Authorization: Bearer <token>`.

Ejemplo:

```
Authorization: Bearer <jwt>
```

Response (200):

```json
{
  "message": "Perfil de usuario obtenido",
  "data": {
    "id": 1,
    "ci": "12345678",
    "name": "Juan Pérez"
  }
}
```

Errores:

- `401`: token faltante/ inválido.
- `404`: usuario no encontrado.
- `500`: error interno.

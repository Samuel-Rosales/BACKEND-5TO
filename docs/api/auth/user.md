# Usuarios

Base URL: `/api/v1/auth/user`

## Modelo (Prisma: `User`)

Campos principales del modelo según `schema.prisma`:

- `id` (Int, autoincrement)
- `ci` (String, **único**) → documento/identificador
- `name` (String)
- `password` (String) → se almacena hasheado (nunca debería volver en `data`)
- `roleId` (Int, **requerido**) → FK a `Role.id`
- `active` (Boolean, default: `true`) → usado como **soft delete**

Relaciones relevantes:

- `User.roleId -> Role.id` (**obligatoria**).
- Un `User` puede estar asociado a `Doctor` (1:1) y/o a `Patient` (1:N) según el resto del sistema.

Notas importantes:

- `ci` es único: no debe repetirse al crear/actualizar.
- `password` es sensible: este doc describe el campo de entrada, pero la API no debería devolverlo.
- El endpoint `DELETE` normalmente **no borra** el registro: cambia `active` a `false`.

## POST `/`

Qué hace:

- Crea un usuario nuevo y lo asocia a un rol (`roleId`).

Cómo usarlo (pasos):

1) Crea/obtén un `roleId` existente (ver Roles).
2) Define `ci` y `name`.
3) Envía una contraseña inicial (`password`).
4) Verifica en la respuesta que el usuario quedó `active: true`.

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

Qué hace:

- Lista usuarios. En la implementación actual, normalmente devuelve solo los usuarios activos (`active: true`).

Cómo usarlo:

- Útil para administración (listado + detalle con `GET /:id`).

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

Qué hace:

- Devuelve un usuario por `id`.

Cómo usarlo:

1) Toma el `id` desde el listado.
2) Llama `GET /:id` para ver detalle y su `role`.

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

Qué hace:

- Actualiza campos del usuario.

Cómo usarlo (pasos):

1) Envía solo los campos a cambiar.
2) Si cambias `password`, el backend debería re-hashearla.
3) Si cambias `roleId`, asegúrate que el rol exista y esté activo.

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

Qué hace:

- Realiza **soft delete** (marca `active=false`).

Cómo usarlo:

- Útil para desactivar acceso sin perder relaciones/historial.

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
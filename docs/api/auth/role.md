# Roles

Base URL: `/api/v1/auth/role`

## Modelo (Prisma: `Role`)

Campos principales del modelo según `schema.prisma`:

- `id` (Int, autoincrement)
- `name` (String, **único**)
- `code` (String, **único**)
- `active` (Boolean, default: `true`) → usado como **soft delete**

Relaciones:

- `Role (1) -> (N) User` por `User.roleId`.

Notas importantes:

- Si intentas crear/actualizar un rol con `name` o `code` repetido (por el constraint `@unique`), el backend debería responder error.
- El endpoint `DELETE` normalmente **no borra** el registro: cambia `active` a `false`.

## POST `/`

Qué hace:

- Crea un rol nuevo.

Cómo usarlo (pasos):

1) Define un `code` estable (ej. `ADMIN`, `DOCTOR`, `RECEPTION`).
2) Define un `name` legible para UI.
3) Envía el JSON. El backend asigna `id` y `active=true` por defecto.

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

Qué hace:

- Lista roles. En la implementación actual, normalmente devuelve solo los roles activos (`active: true`).

Cómo usarlo:

- Úsalo para poblar selects de roles en UI/seed.

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

Qué hace:

- Devuelve un rol por `id`.

Cómo usarlo:

1) Toma el `id` de un listado.
2) Llama `GET /:id` para ver el detalle.

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

Qué hace:

- Actualiza `name` y/o `code` del rol.

Cómo usarlo (pasos):

1) Envía solo los campos que quieras cambiar.
2) Mantén `code` único si lo modificas.

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

Qué hace:

- Realiza **soft delete** (marca `active=false`).

Cómo usarlo:

- Útil para ocultar roles sin perder historial (usuarios existentes pueden seguir relacionados).

Soft delete: setea `active: false`.

Response (200):

```json
{
  "message": "Rol eliminado éxitosamente",
  "data": { "id": 1, "name": "Admin", "code": "ADMIN", "active": false }
}
```
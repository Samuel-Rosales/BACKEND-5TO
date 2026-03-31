# Auth

Base URL: `/api/v1/auth`

Este módulo corresponde al **Módulo de Identidad y Acceso** del `schema.prisma`.

## Modelos (Prisma)

- `Role`: roles del sistema (con soft delete via `active`).
- `User`: usuarios (con soft delete via `active`) y relación obligatoria a `Role` por `roleId`.

## Recursos

- [Roles](role.md)
- [Usuarios](user.md)
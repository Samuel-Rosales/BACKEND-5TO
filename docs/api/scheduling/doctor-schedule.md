# DoctorSchedule

Base URL: `/api/v1/scheduling/doctor-schedule`

## POST `/`

Body:

- `doctorId` (int > 0, **requerido**, debe existir y estar activo)
- `period_start` (string ISO, **requerido**)
- `period_end` (string ISO o `null`, opcional)

Notas:

- Un `DoctorSchedule` define el rango de vigencia del horario.
- `DoctorAvailability` ahora depende de `doctorScheduleId` (no de `doctorId`).

## GET `/`

Filtros (query params, opcionales):

- `doctorId` (int > 0) — filtra por doctor

## GET `/:id` / PUT `/:id` / DELETE `/:id`

DELETE es hard delete.

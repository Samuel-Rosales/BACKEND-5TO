# 2) Endpoints base del servidor

## 2.1 Health
- `GET /` ⇒ status online
- `GET /health` ⇒ `OK`

## 2.2 Rutas registradas (por módulo)
Estos paths están montados en el server:

**Auth**
- `/auth/role`
- `/auth/user`

**Medical**
- `/medical/specialty`
- `/medical/patient`
- `/medical/doctor`
- `/medical/consultation`
- `/medical/prescription`

**Scheduling**
- `/scheduling/status-appointment`
- `/scheduling/appointment-type`
- `/scheduling/appointment`
- `/scheduling/doctor-availability`
- `/scheduling/doctor-schedule-override`

**Inventory**
- `/inventory/product`
- `/inventory/category`
- `/inventory/measurement-unit`
- `/inventory/stock-lot`
- `/inventory/stock-movement`
- `/inventory/supply-consultation`

**Expenses**
- `/expenses/category`
- `/expenses/invoice-expense`
- `/expenses/expense-payment`

**Finance**
- `/finance/exchange-rate`
- `/finance/tax`
- `/finance/payment-method`
- `/finance/status-invoice`
- `/finance/invoice`
- `/finance/invoice-payment`

**Procurement**
- `/procurement/supplier`
- `/procurement/purchase`
- `/procurement/purchase-payment`

> Nota: todos los módulos siguen el patrón CRUD clásico: `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`.

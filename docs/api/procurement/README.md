# Procurement

Base URL: `/api/v1/procurement`

Notas:

- En la mayoría de recursos, los endpoints `GET /:id`, `PUT /:id`, `DELETE /:id` validan que el ID exista mediante `express-validator`. Si el ID no existe, la API responde **400** con el formato de error de validación.

## Recursos

- [Proveedores](supplier.md)
- [Compras](purchase.md)
- [Pagos de compra](purchase-payment.md)
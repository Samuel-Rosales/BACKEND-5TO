# Inventory

Base URL: `/api/v1/inventory`

Notas:

- En la mayoría de recursos, los endpoints `GET /:id`, `PUT /:id`, `DELETE /:id` validan que el ID exista mediante `express-validator`. Si el ID no existe, la API responde **400** con el formato de error de validación (ver [docs/api/README.md](../README.md)).

## Recursos

- [Categorías](category.md)
- [Unidades de medida](measurement-unit.md)
- [Insumos](supply.md)
- [Lotes de stock](stock-lot.md)
- [Movimientos de stock](stock-movement.md)
- [Insumos por consulta](supply-consultation.md)
- [Presentaciones de insumos](supply-presentation.md)

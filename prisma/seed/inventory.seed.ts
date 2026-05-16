import { ensureCategory, ensureMeasurementUnit, ensureProduct, ensureSupplyPresentation, prisma } from "./shared";

export async function seedInventory() {
    const catInsumos = await ensureCategory("Insumos");
    const catPapeleria = await ensureCategory("Papelería");
    const catQuirurgico = await ensureCategory("Material Quirúrgico");
    const catLimpieza = await ensureCategory("Limpieza y Desinfección");

    const unitUnidad = await ensureMeasurementUnit({ name: "Unidad", symbol: "u" });
    const unitCaja = await ensureMeasurementUnit({ name: "Caja", symbol: "cj" });
    const unitLitro = await ensureMeasurementUnit({ name: "Litro", symbol: "L" });
    const unitKilogramo = await ensureMeasurementUnit({ name: "Kilogramo", symbol: "kg" });

    const guantes = await ensureProduct({ name: "Guantes", sku: "INS-GUANTES", cost_price: 1.25, categoryId: catInsumos.id, unitId: unitUnidad.id, min_stock: 100 });
    const jeringa = await ensureProduct({ name: "Jeringa", sku: "INS-JERINGA", cost_price: 0.5, categoryId: catInsumos.id, unitId: unitUnidad.id, min_stock: 200 });
    const paracetamol = await ensureProduct({ name: "Paracetamol 500mg", sku: "MED-PARAC-500", cost_price: 0.1, categoryId: catInsumos.id, unitId: unitCaja.id, min_stock: 50 });
    const algodon = await ensureProduct({ name: "Algodón", sku: "INS-ALGODON", cost_price: 0.2, categoryId: catInsumos.id, unitId: unitUnidad.id, min_stock: 80 });
    const alcohol = await ensureProduct({ name: "Alcohol 70%", sku: "INS-ALCOHOL-70", cost_price: 1.0, categoryId: catInsumos.id, unitId: unitLitro.id, min_stock: 20 });
    const ibuprofeno = await ensureProduct({ name: "Ibuprofeno 400mg", sku: "MED-IBU-400", cost_price: 0.12, categoryId: catInsumos.id, unitId: unitCaja.id, min_stock: 30 });
    const amoxicilina = await ensureProduct({ name: "Amoxicilina 500mg", sku: "MED-AMOX-500", cost_price: 0.18, categoryId: catInsumos.id, unitId: unitCaja.id, min_stock: 40 });
    const lapiz = await ensureProduct({ name: "Lápiz HB", sku: "PAP-LAPIZ-HB", cost_price: 0.08, categoryId: catPapeleria.id, unitId: unitUnidad.id, min_stock: 50 });

    const suturas = await ensureProduct({ name: "Suturas 3-0", sku: "QTX-SUT-3-0", cost_price: 2.5, categoryId: catQuirurgico.id, unitId: unitUnidad.id, min_stock: 30 });
    const gasas = await ensureProduct({ name: "Gasas estériles", sku: "QTX-GASAS", cost_price: 0.35, categoryId: catQuirurgico.id, unitId: unitUnidad.id, min_stock: 100 });
    const vendas = await ensureProduct({ name: "Vendas elásticas", sku: "QTX-VENDAS", cost_price: 1.8, categoryId: catQuirurgico.id, unitId: unitUnidad.id, min_stock: 25 });
    const cloro = await ensureProduct({ name: "Cloro desinfectante", sku: "LIMP-CLORO", cost_price: 2.2, categoryId: catLimpieza.id, unitId: unitLitro.id, min_stock: 10 });
    const jabon = await ensureProduct({ name: "Jabón quirúrgico", sku: "LIMP-JABON", cost_price: 3.5, categoryId: catLimpieza.id, unitId: unitLitro.id, min_stock: 8 });
    const papel = await ensureProduct({ name: "Papel bond carta", sku: "PAP-BOND", cost_price: 0.06, categoryId: catPapeleria.id, unitId: unitUnidad.id, min_stock: 200 });

    // Inactive product — was discontinued
    const oldSupply = await ensureProduct({ name: "Mascarilla básica (descontinuada)", sku: "INS-MASC-OLD", cost_price: 0.15, categoryId: catInsumos.id, unitId: unitUnidad.id, min_stock: 0 });
    await prisma.supply.update({ where: { id: oldSupply.id }, data: { active: false } });

    await ensureSupplyPresentation({ supplyId: paracetamol.id, name: "Caja x24", factor: 24, price: 2.4, barCode: "PARA-CAJA-24" });
    await ensureSupplyPresentation({ supplyId: paracetamol.id, name: "Blister x10", factor: 10, price: 1.0, barCode: "PARA-BLIS-10" });
    await ensureSupplyPresentation({ supplyId: ibuprofeno.id, name: "Caja x20", factor: 20, price: 2.4, barCode: "IBU-CAJA-20" });
    await ensureSupplyPresentation({ supplyId: amoxicilina.id, name: "Caja x30", factor: 30, price: 5.4, barCode: "AMOX-CAJA-30" });
    await ensureSupplyPresentation({ supplyId: guantes.id, name: "Caja x100", factor: 100, price: 125.0, barCode: "GUANTES-CAJA-100" });
    await ensureSupplyPresentation({ supplyId: gasas.id, name: "Paquete x50", factor: 50, price: 17.5, barCode: "GASAS-PACK-50" });

    return {
        categories: {
            insumos: catInsumos.id,
            papeleria: catPapeleria.id,
            quirurgico: catQuirurgico.id,
            limpieza: catLimpieza.id,
        },
        units: {
            unidad: unitUnidad.id,
            caja: unitCaja.id,
            litro: unitLitro.id,
            kilogramo: unitKilogramo.id,
        },
        products: {
            guantes: guantes.id,
            jeringa: jeringa.id,
            paracetamol: paracetamol.id,
            algodon: algodon.id,
            alcohol: alcohol.id,
            ibuprofeno: ibuprofeno.id,
            amoxicilina: amoxicilina.id,
            lapiz: lapiz.id,
            suturas: suturas.id,
            gasas: gasas.id,
            vendas: vendas.id,
            cloro: cloro.id,
            jabon: jabon.id,
            papel: papel.id,
        },
    };
}

import { ensureCategory, ensureMeasurementUnit, ensureProduct } from "./shared";

export async function seedInventory() {
    const catInsumos = await ensureCategory("Insumos");
    const catMedic = await ensureCategory("Medicamentos");
    const catPapeleria = await ensureCategory("Papelería");
    const unitUnidad = await ensureMeasurementUnit({ name: "Unidad", symbol: "u" });
    const unitCaja = await ensureMeasurementUnit({ name: "Caja", symbol: "cj" });

    const guantes = await ensureProduct({ name: "Guantes", sku: "INS-GUANTES", cost_price: 1.25, categoryId: catInsumos.id, unitId: unitUnidad.id });
    const jeringa = await ensureProduct({ name: "Jeringa", sku: "INS-JERINGA", cost_price: 0.5, categoryId: catInsumos.id, unitId: unitUnidad.id });
    const paracetamol = await ensureProduct({ name: "Paracetamol 500mg", sku: "MED-PARAC-500", cost_price: 0.1, categoryId: catMedic.id, unitId: unitCaja.id });
    const algodon = await ensureProduct({ name: "Algodón", sku: "INS-ALGODON", cost_price: 0.2, categoryId: catInsumos.id, unitId: unitUnidad.id });
    const alcohol = await ensureProduct({ name: "Alcohol 70%", sku: "INS-ALCOHOL-70", cost_price: 1.0, categoryId: catInsumos.id, unitId: unitUnidad.id });
    const ibuprofeno = await ensureProduct({ name: "Ibuprofeno 400mg", sku: "MED-IBU-400", cost_price: 0.12, categoryId: catMedic.id, unitId: unitCaja.id });
    const amoxicilina = await ensureProduct({ name: "Amoxicilina 500mg", sku: "MED-AMOX-500", cost_price: 0.18, categoryId: catMedic.id, unitId: unitCaja.id });
    const lapiz = await ensureProduct({ name: "Lápiz HB", sku: "PAP-LAPIZ-HB", cost_price: 0.08, categoryId: catPapeleria.id, unitId: unitUnidad.id });

    return {
        categories: {
            insumos: catInsumos.id,
            medic: catMedic.id,
            papeleria: catPapeleria.id,
        },
        units: {
            unidad: unitUnidad.id,
            caja: unitCaja.id,
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
        },
    };
}

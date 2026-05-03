import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hash(plain: string) {
    return bcrypt.hashSync(plain, 10);
}

async function main() {
    const roleDoctor   = await prisma.role.findFirst({ where: { code: "DOCTOR" } });
    const roleReception = await prisma.role.findFirst({ where: { code: "RECEPTION" } });
    const rolePatient  = await prisma.role.findFirst({ where: { code: "PATIENT" } });
    const roleAdmin    = await prisma.role.findFirst({ where: { code: "ADMIN" } });

    if (!roleDoctor || !roleReception || !rolePatient || !roleAdmin) {
        throw new Error("Faltan roles en la BD. Corre primero el seed principal.");
    }

    console.log("Roles encontrados:", {
        doctor: roleDoctor.id,
        reception: roleReception.id,
        patient: rolePatient.id,
        admin: roleAdmin.id,
    });

    // Usuarios del equipo (CIs reales usadas en auth.service.ts)
    const teamUsers = [
        { ci: "29778174", name: "Edgar (Doctor)",      password: hash("123456"), roleId: roleDoctor.id,    isDoctor: true },
        { ci: "31987430", name: "Recepcionista Demo",  password: hash("123456"), roleId: roleReception.id, isDoctor: false },
        { ci: "27617584", name: "Paciente Demo",       password: hash("123456"), roleId: rolePatient.id,   isDoctor: false },
        { ci: "31350493", name: "Admin Demo",          password: hash("123456"), roleId: roleAdmin.id,     isDoctor: false },
    ];

    for (const u of teamUsers) {
        const existing = await prisma.user.findUnique({ where: { ci: u.ci }, select: { id: true, ci: true } });

        if (existing) {
            console.log(`✅ Ya existe: ${u.ci} (${u.name}) → id=${existing.id}`);
            continue;
        }

        const created = await prisma.user.create({
            data: { ci: u.ci, name: u.name, password: u.password, roleId: u.roleId, active: true },
            select: { id: true, ci: true, name: true },
        });
        console.log(`🆕 Creado: ${created.ci} (${created.name}) → id=${created.id}`);

        if (u.isDoctor) {
            const spec = await prisma.medicalSpecialty.findFirst({ select: { id: true, name: true } });
            if (spec) {
                await prisma.doctor.create({ data: { userId: created.id, specialtyId: spec.id, active: true } });
                console.log(`   👨‍⚕️ Perfil de doctor creado (especialidad: ${spec.name})`);
            }
        }
    }

    console.log("\nSeed del equipo completado.");
}

main()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });

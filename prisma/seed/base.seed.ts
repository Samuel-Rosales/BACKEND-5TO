import { ensureRole, ensureUser, prisma } from "./shared";

export async function seedBase() {
    const roleAdmin = await ensureRole("Admin", "ADMIN", 500);
    const roleDoctor = await ensureRole("Doctor", "DOCTOR");
    const roleReception = await ensureRole("Recepcionista", "RECEPTION", 300);
    const rolePatient = await ensureRole("Paciente", "PATIENT");

    const adminUser = await ensureUser({ ci: "31350493", name: "Samuel Rosales", password: "123456", roleId: roleAdmin.id });
    const doctorUser1 = await ensureUser({ ci: "31366298", name: "Dr. Edgar Briceno", password: "123456", roleId: roleDoctor.id });
    const doctorUser2 = await ensureUser({ ci: "32162980", name: "Dr. Susej Viscaya", password: "123456", roleId: roleDoctor.id });
    const doctorUser3 = await ensureUser({ ci: "29778174", name: "Dr. Jesus Ramos", password: "123456", roleId: roleDoctor.id });
    const receptionistUser = await ensureUser({ ci: "31987430", name: "Heracles Sanchez", password: "123456", roleId: roleReception.id });
    const patientUser = await ensureUser({ ci: "27617584", name: "Juan Sun", password: "123456", roleId: rolePatient.id });
    const patientUser2 = await ensureUser({ ci: "25896321", name: "Maria Lopez", password: "123456", roleId: rolePatient.id });
    const patientUser3 = await ensureUser({ ci: "30147852", name: "Carlos Perez", password: "123456", roleId: rolePatient.id });
    const patientUser4 = await ensureUser({ ci: "28456789", name: "Ana Torres", password: "123456", roleId: rolePatient.id });
    const patientUser5 = await ensureUser({ ci: "30123456", name: "Luis Mendez", password: "123456", roleId: rolePatient.id });
    const patientUser6 = await ensureUser({ ci: "26987453", name: "Carmen Plaza", password: "123456", roleId: rolePatient.id });

    // Inactive user (soft-deleted / disabled)
    const inactiveUser = await ensureUser({ ci: "28569417", name: "Ana Martinez", password: "123456", roleId: rolePatient.id });
    await prisma.user.update({ where: { id: inactiveUser.id }, data: { active: false } });

    return {
        roles: {
            admin: roleAdmin.id,
            doctor: roleDoctor.id,
            reception: roleReception.id,
            patient: rolePatient.id,
        },
        users: {
            admin: adminUser.id,
            doctor1: doctorUser1.id,
            doctor2: doctorUser2.id,
            doctor3: doctorUser3.id,
            reception: receptionistUser.id,
            patient: patientUser.id,
            patient2: patientUser2.id,
            patient3: patientUser3.id,
            patient4: patientUser4.id,
            patient5: patientUser5.id,
            patient6: patientUser6.id,
            inactive: inactiveUser.id,
        },
    };
}

import { ensureRole, ensureUser } from "./shared";

export async function seedBase() {
    const roleAdmin = await ensureRole("Admin", "ADMIN");
    const roleDoctor = await ensureRole("Doctor", "DOCTOR");
    const roleReception = await ensureRole("Recepcionista", "RECEPTION");
    const rolePatient = await ensureRole("Paciente", "PATIENT");

    const adminUser = await ensureUser({ ci: "31350493", name: "Samuel Rosales", password: "123456", roleId: roleAdmin.id });
    const doctorUser1 = await ensureUser({ ci: "31366298", name: "Dr. Edgar Briceno", password: "123456", roleId: roleDoctor.id });
    const doctorUser2 = await ensureUser({ ci: "32162980", name: "Dr. Susej Viscaya", password: "123456", roleId: roleDoctor.id });
    const doctorUser3 = await ensureUser({ ci: "29778174", name: "Dr. Jesus Ramos", password: "123456", roleId: roleDoctor.id });
    const receptionistUser = await ensureUser({ ci: "31987430", name: "Heracles Sanchez", password: "123456", roleId: roleReception.id });
    const patientUser = await ensureUser({ ci: "27617584", name: "Juan Sun", password: "123456", roleId: rolePatient.id });

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
        },
    };
}

import { Sex } from "@prisma/client";

export interface CreateInfoPatientDto {
    patientId?: number;

    sex: Sex;
    birth_date: Date;

    blood_type?: string | null;
    nacionality?: string | null;
    profession?: string | null;

    main_phone?: string | null;
    secondary_phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;

    allergies?: string | null;
    chronic_diseases?: string | null;
    current_medications?: string | null;
    previous_surgeries?: string | null;

    last_visit_at?: Date | null;
}

export interface UpdateInfoPatientDto {
    patientId?: number;

    sex?: Sex;
    birth_date?: Date;

    blood_type?: string | null;
    nacionality?: string | null;
    profession?: string | null;

    main_phone?: string | null;
    secondary_phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;

    allergies?: string | null;
    chronic_diseases?: string | null;
    current_medications?: string | null;
    previous_surgeries?: string | null;

    last_visit_at?: Date | null;
}

// model InfoPatient {
//   id              Int     @id @default(autoincrement())
//   patientId       Int     @unique
  
//   ci              String  @unique
//   name            String
//   last_name       String
//   sex             Sex
//   blood_type      String? @db.Text
//   nacionality      String? @db.Text
//   birth_date      DateTime
//   profession       String? @db.VarChar(100)

//   main_phone       String? @db.VarChar(20)
//   secondary_phone String? @db.VarChar(20)
//   email           String? @db.VarChar(255)
//   address         String? @db.Text
//   city            String? @db.VarChar(100)

//   allergies      String? @db.Text
//   chronic_diseases String? @db.Text
//   current_medications String? @db.Text 
//   previous_surgeries String? @db.Text
  
//   active          Boolean @default(true)

//   patient         Patient @relation(fields: [patientId], references: [id])
// }
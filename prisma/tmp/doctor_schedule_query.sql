SELECT ds.id, ds."doctorId", ds.period_start, ds.period_end FROM "DoctorSchedule" ds WHERE ds."doctorId" = 1 ORDER BY ds.id;
SELECT da."doctorScheduleId", da.day_of_week, da.start_time, da.end_time, da.patient_limit FROM "DoctorAvailability" da WHERE da."doctorScheduleId" IN (SELECT id FROM "DoctorSchedule" WHERE "doctorId" = 1) ORDER BY da.day_of_week, da.start_time;

import { Request, Response } from "express";
import { z } from "zod";
import { DoctorAppointmentsService } from "./doctorAppointments.service";

const reportQuerySchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    userId: z.string().optional(),
  }),
});

export class DoctorAppointmentsController {
  public static async getReport(req: Request, res: Response) {
    try {
      const validatedQuery = reportQuerySchema.parse({ query: req.query }).query;
      const userIdParam = validatedQuery.userId;
      const userIdHeader = req.header("x-doctor-id") ?? undefined;
      const doctorIdFinal = userIdParam ?? userIdHeader;
      const doctorIdNumber = Number(doctorIdFinal);

      if (!Number.isFinite(doctorIdNumber) || doctorIdNumber <= 0) {
        return res.status(400).json({
          message: "doctorId inválido",
          data: null,
          error: "Validación",
        });
      }

      const data = await DoctorAppointmentsService.getReport(doctorIdNumber, validatedQuery);
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Error de validación en parámetros",
          errors: error.errors,
        });
      }

      console.error("[DoctorAppointmentsController.getReport] Error:", error);
      return res.status(500).json({
        message: "Error interno al obtener el reporte de citas",
        error: error.message,
      });
    }
  }
}

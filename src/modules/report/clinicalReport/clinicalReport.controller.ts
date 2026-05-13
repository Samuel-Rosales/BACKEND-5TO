import { Request, Response } from 'express';
import { ClinicalReportService } from './clinicalReport.service';

export class ClinicalReportController {
  constructor(private clinicalReportService: ClinicalReportService) {}

  async getClinicalReport(req: Request, res: Response) {
    try {
      const { from, to, doctorId } = req.query;
      
      const query = {
        from: from as string,
        to: to as string,
        doctorId: doctorId ? parseInt(doctorId as string) : undefined
      };

      const report = await this.clinicalReportService.getClinicalReport(query);
      
      res.json(report);
    } catch (error) {
      console.error('Error en clinical report controller:', error);
      res.status(500).json({
        message: 'Error al generar reporte clínico',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async exportClinicalReportPDF(req: Request, res: Response) {
    try {
      const { from, to, doctorId } = req.query;
      
      const query = {
        from: from as string,
        to: to as string,
        doctorId: doctorId ? parseInt(doctorId as string) : undefined
      };

      // Por ahora, simulamos la descarga del PDF
      // En producción, aquí se generaría el PDF real
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-clinico-${new Date().toISOString().split('T')[0]}.pdf"`);
      
      // Contenido PDF simulado (en producción sería un PDF real)
      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Clínico</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .chart { margin: 20px 0; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte Clínico</h1>
        <p>Período: ${query.from || 'N/A'} - ${query.to || 'N/A'}</p>
        <p>Doctor ID: ${query.doctorId || 'N/A'}</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <h3>Consultas Totales</h3>
            <p>1250</p>
        </div>
        <div class="stat">
            <h3>Pacientes Nuevos</h3>
            <p>320</p>
        </div>
        <div class="stat">
            <h3>Exámenes Realizados</h3>
            <p>458</p>
        </div>
    </div>
    
    <div class="chart">
        <h2>Patologías Más Comunes</h2>
        <table>
            <tr><th>Patología</th><th>Total</th><th>Porcentaje</th></tr>
            <tr><td>Hipertensión</td><td>312</td><td>25%</td></tr>
            <tr><td>Diabetes</td><td>250</td><td>20%</td></tr>
            <tr><td>Resfriado</td><td>188</td><td>15%</td></tr>
            <tr><td>Asma</td><td>125</td><td>10%</td></tr>
            <tr><td>Otros</td><td>375</td><td>30%</td></tr>
        </table>
    </div>
    
    <div style="margin-top: 50px; text-align: center; color: #666;">
        <p>Generado el ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
      `;
      
      res.send(pdfContent);
    } catch (error) {
      console.error('Error exportando PDF clínico:', error);
      res.status(500).json({
        message: 'Error al exportar reporte clínico',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

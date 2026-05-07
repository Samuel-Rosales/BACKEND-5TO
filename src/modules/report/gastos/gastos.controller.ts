import { Request, Response } from 'express';
import { GastosService } from './gastos.service';
import { validateCommonQuery } from './gastos.validator';
import { z } from 'zod';

export class GastosController {
  public static async getSummary(req: Request, res: Response) {
    try {
      const { query } = validateCommonQuery(req.query);
      const data = await GastosService.getSummary(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[GastosController.getSummary] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener resumen de gastos',
        error: error.message,
      });
    }
  }

  public static async getCompras(req: Request, res: Response) {
    try {
      const { query } = validateCommonQuery(req.query);
      const data = await GastosService.getCompras(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[GastosController.getCompras] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener reporte de compras',
        error: error.message,
      });
    }
  }

  public static async getServicios(req: Request, res: Response) {
    try {
      const { query } = validateCommonQuery(req.query);
      const data = await GastosService.getServicios(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[GastosController.getServicios] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener cuentas por pagar',
        error: error.message,
      });
    }
  }

  public static async getNomina(req: Request, res: Response) {
    try {
      const { query } = validateCommonQuery(req.query);
      const data = await GastosService.getNomina(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[GastosController.getNomina] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener nómina',
        error: error.message,
      });
    }
  }
}
import { Request, Response } from 'express';
import { IngresosService } from './ingresos.service';
import { validateCommonQuery } from './ingresos.validator';
import { z } from 'zod';

export class IngresosController {
  public static async getSummary(req: Request, res: Response) {
    try {
      const query = validateCommonQuery(req.query);
      const data = await IngresosService.getSummary(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[IngresosController.getSummary] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener resumen de ingresos',
        error: error.message,
      });
    }
  }

  public static async getServicios(req: Request, res: Response) {
    try {
      const query = validateCommonQuery(req.query);
      const data = await IngresosService.getServicios(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[IngresosController.getServicios] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener ventas por servicio',
        error: error.message,
      });
    }
  }

  public static async getCartera(req: Request, res: Response) {
    try {
      const query = validateCommonQuery(req.query);
      const data = await IngresosService.getCartera(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[IngresosController.getCartera] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener cartera',
        error: error.message,
      });
    }
  }

  public static async getRecaudacion(req: Request, res: Response) {
    try {
      const query = validateCommonQuery(req.query);
      const data = await IngresosService.getRecaudacion(query);
      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }
      console.error('[IngresosController.getRecaudacion] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener recaudación',
        error: error.message,
      });
    }
  }
}
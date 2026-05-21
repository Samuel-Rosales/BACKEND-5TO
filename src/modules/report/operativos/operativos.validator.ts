import { query } from 'express-validator';

const allowedPeriods = ['day', 'week', 'month', 'year'] as const;

export class OperativosValidator {
	public reportQueryValidators = [
		query('from').optional().isISO8601().withMessage('La fecha from debe tener formato YYYY-MM-DD'),
		query('to').optional().isISO8601().withMessage('La fecha to debe tener formato YYYY-MM-DD'),
		query('period').optional().isIn(allowedPeriods).withMessage('El period debe ser day, week, month o year'),
	];
}

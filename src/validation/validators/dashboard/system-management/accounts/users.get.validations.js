import { query } from 'express-validator';

export default [
	query('search').isString().trim().escape().optional().default(''),
	query('page').isNumeric().toInt().optional().default(1),
	query('limit').isNumeric().toInt().optional().default(10),
];

import { describe, it, expect } from 'vitest';
import validators from '../../../../../../src/validation/validators/dashboard/own-account/own-account.audit-log.validations.js';
import { mockReq, runValidators } from '../../../helpers.js';

describe('own-account.audit-log.validations', () => {
	it('passes with a valid numeric weeks value and converts weeks to integer when provided', async () => {
		const req = mockReq({ query: { weeks: '3' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
		expect(typeof req.query.weeks).toBe('number');
		expect(req.query.weeks).toBe(3);
	});
});

import { describe, it, expect } from 'vitest';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/accounts/users.get.validations.js';
import { mockReq, runValidators } from '../../../../helpers.js';

describe('users.get.validations', () => {
	it('passes with no query params (all are optional)', async () => {
		const req = mockReq({ query: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes with valid search, page, and limit', async () => {
		const req = mockReq({ query: { search: 'alice', page: '2', limit: '25' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes when search is an empty string', async () => {
		const req = mockReq({ query: { search: '' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('converts page to integer when provided', async () => {
		const req = mockReq({ query: { page: '3' } });
		await runValidators(validators, req);
		expect(typeof req.query.page).toBe('number');
		expect(req.query.page).toBe(3);
	});

	it('converts limit to integer when provided', async () => {
		const req = mockReq({ query: { limit: '50' } });
		await runValidators(validators, req);
		expect(typeof req.query.limit).toBe('number');
		expect(req.query.limit).toBe(50);
	});
});

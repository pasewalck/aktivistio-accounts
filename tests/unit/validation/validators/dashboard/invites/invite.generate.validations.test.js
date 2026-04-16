import { describe, it, expect } from 'vitest';
import validators from '../../../../../../src/validation/validators/dashboard/invites/invite.generate.validations.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

describe('invite.generate.validations', () => {
	describe('count field', () => {
		it('passes with a valid count of 1', async () => {
			const req = mockReq({ body: { count: 1 } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(true);
		});

		it('passes with a valid count of 1000', async () => {
			const req = mockReq({ body: { count: 1000 } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(true);
		});

		it('passes with a valid count of 500', async () => {
			const req = mockReq({ body: { count: 500 } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(true);
		});

		it('fails when count is missing', async () => {
			const req = mockReq({ body: {} });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(false);
			expect(errorFields(result)).toContain('count');
		});

		it('fails when count is 0', async () => {
			const req = mockReq({ body: { count: 0 } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(false);
			expect(errorFields(result)).toContain('count');
		});

		it('fails when count exceeds 1000', async () => {
			const req = mockReq({ body: { count: 1001 } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(false);
			expect(errorFields(result)).toContain('count');
		});

		it('fails when count is negative', async () => {
			const req = mockReq({ body: { count: -1 } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(false);
			expect(errorFields(result)).toContain('count');
		});

		it('converts count to integer', async () => {
			const req = mockReq({ body: { count: '5' } });
			await runValidators(validators, req);
			expect(typeof req.body.count).toBe('number');
			expect(req.body.count).toBe(5);
		});
	});

	describe('date field', () => {
		it('passes with a valid date string', async () => {
			const req = mockReq({ body: { count: 1, date: '2026-12-31' } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(true);
		});

		it('passes when date is omitted (optional)', async () => {
			const req = mockReq({ body: { count: 1 } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(true);
		});

		it('fails with an invalid date string', async () => {
			const req = mockReq({ body: { count: 1, date: 'not-a-date' } });
			const result = await runValidators(validators, req);
			expect(result.isEmpty()).toBe(false);
			expect(errorFields(result)).toContain('date');
		});
	});
});

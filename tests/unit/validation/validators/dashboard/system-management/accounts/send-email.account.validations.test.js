import { describe, it, expect } from 'vitest';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/accounts/send-email.account.validations.js';
import { mockReq, runValidators, errorFields } from '../../../../helpers.js';

describe('send-email.account.validations', () => {
	it('passes with a valid email address', async () => {
		const req = mockReq({ body: { email: 'user@example.com' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails with an invalid email format', async () => {
		const req = mockReq({ body: { email: 'not-an-email' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails with an email missing the domain', async () => {
		const req = mockReq({ body: { email: 'user@' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});
});

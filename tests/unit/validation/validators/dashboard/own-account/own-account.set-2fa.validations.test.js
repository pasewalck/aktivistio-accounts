import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../src/helpers/two-factor-auth.js', () => ({
	default: {
		verify: vi.fn(),
		generateSecret: vi.fn(),
		generateToken: vi.fn(),
	},
}));

import twoFactorAuth from '../../../../../../src/helpers/two-factor-auth.js';
import validators from '../../../../../../src/validation/validators/dashboard/own-account/own-account.set-2fa.validations.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

describe('own-account.set-2fa.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with a valid secret and a verified TOTP token', async () => {
		twoFactorAuth.verify.mockReturnValue(true);
		const req = mockReq({
			body: { secret: 'BASE32SECRET', token: '123456' },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when secret is missing', async () => {
		twoFactorAuth.verify.mockReturnValue(true);
		const req = mockReq({ body: { token: '123456' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('secret');
	});

	it('fails when secret is empty string', async () => {
		twoFactorAuth.verify.mockReturnValue(true);
		const req = mockReq({ body: { secret: '', token: '123456' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('secret');
	});

	it('fails when token is missing', async () => {
		const req = mockReq({ body: { secret: 'BASE32SECRET' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when TOTP verification fails', async () => {
		twoFactorAuth.verify.mockReturnValue(false);
		const req = mockReq({ body: { secret: 'BASE32SECRET', token: '000000' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});
});

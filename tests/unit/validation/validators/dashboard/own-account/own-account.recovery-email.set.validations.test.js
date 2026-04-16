import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../src/services/account.service.js', () => ({
	default: {
		password: { check: vi.fn() },
	},
}));

import accountService from '../../../../../../src/services/account.service.js';
import validators from '../../../../../../src/validation/validators/dashboard/own-account/own-account.recovery-email.set.validations.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

const mockAccount = { id: 'user-1' };
const EXAMPLE_PASSWORD = 'correct-password';

describe('own-account.recovery-email.set.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with correct password and a valid email', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD, email: 'user@example.com' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when currentPassword is missing', async () => {
		const req = mockReq({
			body: { email: 'user@example.com' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when currentPassword is incorrect', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({
			body: { currentPassword: 'wrong', email: 'user@example.com' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when email is missing', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when email is empty string', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD, email: '' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when email has invalid format', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD, email: 'not-an-email' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});
});

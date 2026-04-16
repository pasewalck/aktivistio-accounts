import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../src/services/account.service.js', () => ({
	default: {
		password: { check: vi.fn() },
	},
}));

import accountService from '../../../../../../src/services/account.service.js';
import validators from '../../../../../../src/validation/validators/dashboard/own-account/own-account.recovery-token.set.validations.js';
import { generateRecoveryToken } from '../../../../../../src/helpers/recovery-token-string.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

const mockAccount = { id: 'user-1' };
const VALID_TOKEN = generateRecoveryToken();
const EXAMPLE_PASSWORD = 'correct-password';

describe('own-account.recovery-token.set.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with all valid fields', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD, token: VALID_TOKEN, tokenVerify: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when currentPassword is missing', async () => {
		const req = mockReq({
			body: { token: VALID_TOKEN, tokenVerify: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when currentPassword is wrong', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({
			body: { currentPassword: 'wrong', token: VALID_TOKEN, tokenVerify: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when token is missing', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD, tokenVerify: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when token has invalid format', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD, token: 'bad-token', tokenVerify: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when tokenVerify is false (user has not confirmed saving the token)', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: EXAMPLE_PASSWORD, token: VALID_TOKEN, tokenVerify: false },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('tokenVerify');
	});
});

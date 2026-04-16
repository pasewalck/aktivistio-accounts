import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/services/account.service.js', () => ({
	default: {
		find: { withId: vi.fn() },
		twoFactorAuth: { check: vi.fn() },
	},
}));

import accountService from '../../../../../src/services/account.service.js';
import validators from '../../../../../src/validation/validators/logged-out/login-2fa.validations.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

const SESSION_TOKEN = 'session-login-token-abc';
const ACCOUNT_ID = crypto.randomUUID();
const mockAccount = { id: ACCOUNT_ID };

describe('login-2fa.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with a valid TOTP token and matching session token', async () => {
		accountService.find.withId.mockReturnValue(mockAccount);
		accountService.twoFactorAuth.check.mockReturnValue(true);
		const req = mockReq({
			body: { token: '123456', twoFactorLoginToken: SESSION_TOKEN },
			session: { twoFactorLogin: { accountId: ACCOUNT_ID, loginToken: SESSION_TOKEN } },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when token field is missing', async () => {
		const req = mockReq({
			body: { twoFactorLoginToken: SESSION_TOKEN },
			session: { twoFactorLogin: { accountId: ACCOUNT_ID, loginToken: SESSION_TOKEN } },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when token is not an integer', async () => {
		accountService.find.withId.mockReturnValue(mockAccount);
		const req = mockReq({
			body: { token: 'abcdef', twoFactorLoginToken: SESSION_TOKEN },
			session: { twoFactorLogin: { accountId: ACCOUNT_ID, loginToken: SESSION_TOKEN } },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when TOTP verification fails', async () => {
		accountService.find.withId.mockReturnValue(mockAccount);
		accountService.twoFactorAuth.check.mockReturnValue(false);
		const req = mockReq({
			body: { token: '000000', twoFactorLoginToken: SESSION_TOKEN },
			session: { twoFactorLogin: { accountId: ACCOUNT_ID, loginToken: SESSION_TOKEN } },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when twoFactorLoginToken is missing', async () => {
		accountService.find.withId.mockReturnValue(mockAccount);
		accountService.twoFactorAuth.check.mockReturnValue(true);
		const req = mockReq({
			body: { token: '123456' },
			session: { twoFactorLogin: { accountId: ACCOUNT_ID, loginToken: SESSION_TOKEN } },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('twoFactorLoginToken');
	});

	it('fails when twoFactorLoginToken does not match session token', async () => {
		accountService.find.withId.mockReturnValue(mockAccount);
		accountService.twoFactorAuth.check.mockReturnValue(true);
		const req = mockReq({
			body: { token: '123456', twoFactorLoginToken: 'wrong-token' },
			session: { twoFactorLogin: { accountId: ACCOUNT_ID, loginToken: SESSION_TOKEN } },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('twoFactorLoginToken');
	});
});

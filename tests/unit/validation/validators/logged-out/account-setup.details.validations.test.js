import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/services/account.service.js', () => ({
	default: {
		find: { withUsername: vi.fn(), withId: vi.fn() },
		actionToken: { getEntry: vi.fn() },
	},
}));

import accountService from '../../../../../src/services/account.service.js';
import validators from '../../../../../src/validation/validators/logged-out/account-setup.details.validations.js';
import { generateRecoveryToken } from '../../../../../src/helpers/recovery-token-string.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';
import { generateAlphanumericSecret } from '../../../../../src/helpers/generate-secrets.js';

const STRONG_PASSWORD = generateAlphanumericSecret(30);
const VALID_TOKEN = generateRecoveryToken();

function validBody(overrides = {}) {
	return {
		username: 'newuser',
		password: STRONG_PASSWORD,
		passwordConfirm: STRONG_PASSWORD,
		recoveryMethod: 'token',
		recoveryToken: VALID_TOKEN,
		recoveryTokenVerify: true,
		...overrides,
	};
}

describe('account-setup.details.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		accountService.find.withUsername.mockReturnValue(null); // username not taken
		accountService.actionToken.getEntry.mockReturnValue(null); // no action token entry
	});

	it('passes with a valid, available username and all required fields', async () => {
		const req = mockReq({ body: validBody(), params: { actionToken: 'some-token' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when username is missing', async () => {
		const req = mockReq({ body: validBody({ username: undefined }), params: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username is taken (and no allowUsername callback match)', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1, username: 'newuser' });
		const req = mockReq({ body: validBody(), params: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('allows keeping an existing username when action token entry matches', async () => {
		// Username is "taken" by the account being set up
		accountService.find.withUsername.mockReturnValue({ id: 'acc-1', username: 'olduser' });
		accountService.actionToken.getEntry.mockReturnValue({ payload: { accountId: 'acc-1' } });
		accountService.find.withId.mockReturnValue({ id: 'acc-1', username: 'olduser' });
		const req = mockReq({ body: validBody({ username: 'olduser' }), params: { actionToken: 'valid-token' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when password is weak', async () => {
		const req = mockReq({
			body: validBody({ password: 'password', passwordConfirm: 'password' }),
			params: {},
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when password confirmation does not match', async () => {
		const req = mockReq({ body: validBody({ passwordConfirm: 'mismatch' }), params: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('passwordConfirm');
	});
});

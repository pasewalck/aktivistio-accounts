import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/services/account.service.js', () => ({
	default: {
		find: { withUsername: vi.fn() },
	},
}));

vi.mock('../../../../../src/services/invites.service.js', () => ({
	default: {
		validate: vi.fn(),
	},
}));

import accountService from '../../../../../src/services/account.service.js';
import invitesService from '../../../../../src/services/invites.service.js';
import validators from '../../../../../src/validation/validators/logged-out/register.validations.js';
import { generateRecoveryToken } from '../../../../../src/helpers/recovery-token-string.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

const STRONG_PASSWORD = 'correct-horse-battery-staple';
const VALID_TOKEN = generateRecoveryToken();

function validBody(overrides = {}) {
	return {
		inviteCode: 'VALIDCODE1',
		username: 'newuser',
		password: STRONG_PASSWORD,
		passwordConfirm: STRONG_PASSWORD,
		recoveryMethod: 'token',
		recoveryToken: VALID_TOKEN,
		recoveryTokenVerify: true,
		...overrides,
	};
}

describe('register.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default: invite is valid, username not taken
		invitesService.validate.mockReturnValue({ id: 'inv-1', code: 'VALIDCODE1' });
		accountService.find.withUsername.mockReturnValue(null);
	});

	it('passes with all valid fields (token recovery method)', async () => {
		const req = mockReq({ body: validBody() });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when inviteCode is missing', async () => {
		const req = mockReq({ body: validBody({ inviteCode: undefined }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('inviteCode');
	});

	it('fails when username is missing', async () => {
		const req = mockReq({ body: validBody({ username: undefined }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username is already taken', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1 });
		const req = mockReq({ body: validBody() });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});
});

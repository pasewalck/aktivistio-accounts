import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/services/account.service.js', () => ({
	default: {
		find: { withUsername: vi.fn() },
		recovery: {
			email: { check: vi.fn() },
			token: { check: vi.fn() },
		},
	},
}));

import accountService from '../../../../../src/services/account.service.js';
import validators from '../../../../../src/validation/validators/logged-out/recovery.request.validations.js';
import { generateRecoveryToken } from '../../../../../src/helpers/recovery-token-string.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

const VALID_RECOVERY_TOKEN = generateRecoveryToken();
const mockAccount = { id: 'user-1', username: 'alice' };

describe('recovery.request.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with valid username and email recovery method', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		accountService.recovery.email.check.mockResolvedValue(true);
		const req = mockReq({
			body: { username: 'alice', method: 'email', email: 'alice@example.com' },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes with valid username and token recovery method', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		accountService.recovery.token.check.mockResolvedValue(true);
		const req = mockReq({
			body: { username: 'alice', method: 'token', token: VALID_RECOVERY_TOKEN },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when username is missing', async () => {
		const req = mockReq({ body: { method: 'email', email: 'alice@example.com' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username does not exist', async () => {
		accountService.find.withUsername.mockReturnValue(null);
		const req = mockReq({ body: { username: 'nobody', method: 'email', email: 'x@x.com' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when method is missing', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		const req = mockReq({ body: { username: 'alice' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('method');
	});

	it('fails when method is an invalid value', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		const req = mockReq({ body: { username: 'alice', method: 'sms' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('method');
	});

	it('fails when method is email but email is missing', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		const req = mockReq({ body: { username: 'alice', method: 'email' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when method is email but email has invalid format', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		const req = mockReq({ body: { username: 'alice', method: 'email', email: 'bad-email' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when method is email but recovery email check fails', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		accountService.recovery.email.check.mockResolvedValue(false);
		const req = mockReq({ body: { username: 'alice', method: 'email', email: 'wrong@example.com' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when method is token but token is missing', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		const req = mockReq({ body: { username: 'alice', method: 'token' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when method is token but token has invalid format', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		const req = mockReq({ body: { username: 'alice', method: 'token', token: 'bad-token' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when method is token but recovery token check fails', async () => {
		accountService.find.withUsername.mockReturnValue(mockAccount);
		accountService.recovery.token.check.mockResolvedValue(false);
		const req = mockReq({
			body: { username: 'alice', method: 'token', token: VALID_RECOVERY_TOKEN },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});
});

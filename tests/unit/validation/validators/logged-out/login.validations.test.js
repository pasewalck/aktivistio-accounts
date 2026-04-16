import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/services/account.service.js', () => ({
	default: {
		find: { withUsername: vi.fn() },
		checkLogin: vi.fn(),
	},
}));

import accountService from '../../../../../src/services/account.service.js';
import validators from '../../../../../src/validation/validators/logged-out/login.validations.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

describe('login.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with a valid username and correct password', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1, username: 'alice' });
		accountService.checkLogin.mockResolvedValue(true);
		const req = mockReq({ body: { username: 'alice', password: 'correct-password' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when username does not exist', async () => {
		accountService.find.withUsername.mockReturnValue(null);
		const req = mockReq({ body: { username: 'nobody', password: 'somepassword' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username field is missing', async () => {
		const req = mockReq({ body: { password: 'somepassword' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when password field is missing', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1 });
		const req = mockReq({ body: { username: 'alice' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when password is incorrect', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1 });
		accountService.checkLogin.mockResolvedValue(false);
		const req = mockReq({ body: { username: 'alice', password: 'wrong' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when both fields are missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
	});
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../src/services/account.service.js', () => ({
	default: {
		password: { check: vi.fn() },
	},
}));

import accountService from '../../../../../../src/services/account.service.js';
import validators from '../../../../../../src/validation/validators/dashboard/own-account/own-account.delete.validations.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

const mockAccount = { id: 'user-1' };

describe('own-account.delete.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with correct password and confirmation', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { password: 'correct-password', confirm: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when password is missing', async () => {
		const req = mockReq({ body: { confirm: true }, account: mockAccount });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when password is incorrect', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({
			body: { password: 'wrong', confirm: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when confirm is missing', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({ body: { password: 'correct-password' }, account: mockAccount });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('confirm');
	});

	it('fails when confirm is false', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { password: 'correct-password', confirm: false },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('confirm');
	});
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../src/services/account.service.js', () => ({
	default: {
		password: { check: vi.fn() },
	},
}));

import accountService from '../../../../../../src/services/account.service.js';
import validators from '../../../../../../src/validation/validators/dashboard/own-account/own-account.change-password.validations.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

const mockAccount = { id: 'user-1' };
const STRONG_PASSWORD = 'correct-horse-battery-staple';

describe('own-account.change-password.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with correct current password, strong new password, and matching confirmation', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: {
				currentPassword: 'old-password',
				newPassword: STRONG_PASSWORD,
				confirmNewPassword: STRONG_PASSWORD,
			},
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when currentPassword is missing', async () => {
		const req = mockReq({
			body: { newPassword: STRONG_PASSWORD, confirmNewPassword: STRONG_PASSWORD },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when currentPassword is incorrect', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({
			body: {
				currentPassword: 'wrong',
				newPassword: STRONG_PASSWORD,
				confirmNewPassword: STRONG_PASSWORD,
			},
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when newPassword is weak', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: {
				currentPassword: 'old-password',
				newPassword: 'password',
				confirmNewPassword: 'password',
			},
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('newPassword');
	});

	it('fails when newPassword is missing', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: 'old-password', confirmNewPassword: STRONG_PASSWORD },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('newPassword');
	});

	it('fails when confirmNewPassword is missing', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { currentPassword: 'old-password', newPassword: STRONG_PASSWORD },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('confirmNewPassword');
	});

	it('fails when confirmNewPassword does not match newPassword', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: {
				currentPassword: 'old-password',
				newPassword: STRONG_PASSWORD,
				confirmNewPassword: 'different-password',
			},
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('confirmNewPassword');
	});
});

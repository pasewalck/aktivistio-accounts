import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../src/services/account.service.js', () => ({
	default: {
		password: { check: vi.fn() },
	},
}));

import accountService from '../../../../../../src/services/account.service.js';
import validators from '../../../../../../src/validation/validators/dashboard/own-account/own-account.recovery-method.delete.validations.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

const mockAccount = { id: 'user-1' };

describe('own-account.recovery-method.delete.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with correct current password', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({ body: { currentPassword: 'correct-password' }, account: mockAccount });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when currentPassword is missing', async () => {
		const req = mockReq({ body: {}, account: mockAccount });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when currentPassword is incorrect', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({ body: { currentPassword: 'wrong' }, account: mockAccount });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});
});

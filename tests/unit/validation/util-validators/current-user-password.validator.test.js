import { describe, it, expect, vi, beforeEach } from 'vitest';
import { body } from 'express-validator';

vi.mock('../../../../src/services/account.service.js', () => ({
	default: {
		password: {
			check: vi.fn(),
		},
	},
}));

import accountService from '../../../../src/services/account.service.js';
import currentUserPasswordValidator from '../../../../src/validation/util-validators/current-user-password.validator.js';
import { mockReq, runValidators, errorFields } from '../helpers.js';

function makeValidators(field = 'currentPassword') {
	return [currentUserPasswordValidator(body(field))];
}

const mockAccount = { id: 'user-1', username: 'testuser' };
const mockedAccountPassword = 'my-password';

describe('current-user-password.validator', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes when password is correct', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({ body: { currentPassword: mockedAccountPassword }, account: mockAccount });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(true);
		expect(accountService.password.check).toHaveBeenCalledWith(mockAccount, mockedAccountPassword);
	});

	it('fails when password is wrong', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({ body: { currentPassword: 'wrong-password' }, account: mockAccount });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
	});

	it('fails when password field is missing', async () => {
		const req = mockReq({ body: {}, account: mockAccount });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
		// Should bail before calling the service
		expect(accountService.password.check).not.toHaveBeenCalled();
	});

	it('fails when password field is empty string', async () => {
		const req = mockReq({ body: { currentPassword: '' }, account: mockAccount });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('currentPassword');
		expect(accountService.password.check).not.toHaveBeenCalled();
	});

	it('works with a custom field name', async () => {
		accountService.password.check.mockResolvedValue(true);
		const validators = [currentUserPasswordValidator(body('adminPassword'))];
		const req = mockReq({ body: { adminPassword: 'secret' }, account: mockAccount });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});
});

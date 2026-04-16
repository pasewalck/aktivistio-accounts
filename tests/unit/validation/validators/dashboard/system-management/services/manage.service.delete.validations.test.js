import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../../src/services/account.service.js', () => ({
	default: {
		password: {
			check: vi.fn(),
		},
	},
}));

import accountService from '../../../../../../../src/services/account.service.js';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/services/manage.service.delete.validations.js';
import { mockReq, runValidators, errorFields } from '../../../../helpers.js';

const mockAccount = { id: 'admin-1' };
const EXAMPLE_PASSWORD = 'correct-password';

describe('manage.service.delete.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with correct password and confirmation', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { deletePermAdminPassword: EXAMPLE_PASSWORD, deleteAdminConfirm: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when password field is missing', async () => {
		const req = mockReq({
			body: { deleteAdminConfirm: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('deletePermAdminPassword');
	});

	it('fails when password is incorrect', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({
			body: { deletePermAdminPassword: 'wrong', deleteAdminConfirm: true },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('deletePermAdminPassword');
	});

	it('fails when confirmation is missing', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { deletePermAdminPassword: EXAMPLE_PASSWORD },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('deleteAdminConfirm');
	});

	it('fails when confirmation is false', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { deletePermAdminPassword: EXAMPLE_PASSWORD, deleteAdminConfirm: false },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('deleteAdminConfirm');
	});
});

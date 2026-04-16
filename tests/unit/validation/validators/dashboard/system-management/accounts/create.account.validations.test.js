import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../../src/services/account.service.js', () => ({
	default: {
		find: { withUsername: vi.fn() },
	},
}));

import accountService from '../../../../../../../src/services/account.service.js';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/accounts/create.account.validations.js';
import { Role } from '../../../../../../../src/models/roles.js';
import { mockReq, runValidators, errorFields } from '../../../../helpers.js';

const SUPER_ADMIN_ACCOUNT = { id: 'sa-1', role: Role.SUPER_ADMIN };
const ADMIN_ACCOUNT = { id: 'admin-1', role: Role.ADMIN };

describe('create.account.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		accountService.find.withUsername.mockReturnValue(null); // username not taken
	});

	it('passes with a valid username and role below requester', async () => {
		const req = mockReq({
			body: { username: 'newuser', role: String(Role.USER) },
			account: ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes when SUPER_ADMIN creates an ADMIN account', async () => {
		const req = mockReq({
			body: { username: 'newadmin', role: String(Role.ADMIN) },
			account: SUPER_ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when username is missing', async () => {
		const req = mockReq({
			body: { role: String(Role.USER) },
			account: ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username is already taken', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1 });
		const req = mockReq({
			body: { username: 'existinguser', role: String(Role.USER) },
			account: ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when role field is missing', async () => {
		const req = mockReq({
			body: { username: 'newuser' },
			account: ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('role');
	});

	it('fails when role value is not in the valid roles list', async () => {
		const req = mockReq({
			body: { username: 'newuser', role: '99' },
			account: SUPER_ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('role');
	});

	it('fails when role is equal to the requesting user role', async () => {
		// ADMIN (4) trying to create another ADMIN (4)
		const req = mockReq({
			body: { username: 'newuser', role: String(Role.ADMIN) },
			account: ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('role');
	});

	it('fails when role is higher than the requesting user role', async () => {
		// ADMIN (4) trying to create SUPER_ADMIN (5)
		const req = mockReq({
			body: { username: 'newuser', role: String(Role.SUPER_ADMIN) },
			account: ADMIN_ACCOUNT,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('role');
	});
});

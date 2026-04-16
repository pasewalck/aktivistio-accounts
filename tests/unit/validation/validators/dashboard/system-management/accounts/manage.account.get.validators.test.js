import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../../src/services/account.service.js', () => ({
	default: {
		find: { withId: vi.fn() },
	},
}));

import accountService from '../../../../../../../src/services/account.service.js';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/accounts/manage.account.get.validators.js';
import { Role } from '../../../../../../../src/models/roles.js';
import { mockReq, runValidators, errorFields } from '../../../../helpers.js';

const ADMIN_ACCOUNT = { id: 'admin-1', role: Role.ADMIN };
const TARGET_MODERATOR = { id: 'mod-1', role: Role.MODERATOR };
const VALID_UUID = crypto.randomUUID();

describe('manage.account.get.validators', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes when id is a valid UUID and target account has lower role', async () => {
		accountService.find.withId.mockReturnValue(TARGET_MODERATOR);
		const req = mockReq({ params: { id: VALID_UUID }, account: ADMIN_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when id param is missing', async () => {
		const req = mockReq({ params: {}, account: ADMIN_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});

	it('fails when id is not a valid UUID', async () => {
		const req = mockReq({ params: { id: 'not-a-uuid' }, account: ADMIN_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});

	it('fails when account is not found', async () => {
		accountService.find.withId.mockReturnValue(null);
		const req = mockReq({ params: { id: VALID_UUID }, account: ADMIN_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});

	it('fails when target account has same role as requester', async () => {
		// ADMIN cannot view another ADMIN
		accountService.find.withId.mockReturnValue({ id: 'admin-2', role: Role.ADMIN });
		const req = mockReq({ params: { id: VALID_UUID }, account: ADMIN_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});

	it('fails when target account has higher role than requester', async () => {
		accountService.find.withId.mockReturnValue({ id: 'super-1', role: Role.SUPER_ADMIN });
		const req = mockReq({ params: { id: VALID_UUID }, account: ADMIN_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});
});

import { describe, it, expect } from 'vitest';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/accounts/manage.account.update.validations.js';
import { Role } from '../../../../../../../src/models/roles.js';
import { mockReq, runValidators, errorFields } from '../../../../helpers.js';

describe('manage.account.update.validations', () => {
	it('passes when role is valid and strictly less than the requester role', async () => {
		// SUPER_ADMIN (5) assigning ADMIN (4)
		const req = mockReq({
			body: { accountUpdateRole: String(Role.ADMIN) },
			account: { role: Role.SUPER_ADMIN },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes when ADMIN assigns MODERATOR role', async () => {
		const req = mockReq({
			body: { accountUpdateRole: String(Role.MODERATOR) },
			account: { role: Role.ADMIN },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when role field is missing', async () => {
		const req = mockReq({ body: {}, account: { role: Role.SUPER_ADMIN } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('accountUpdateRole');
	});

	it('fails when role value is not in the valid roles list', async () => {
		const req = mockReq({
			body: { accountUpdateRole: '99' },
			account: { role: Role.SUPER_ADMIN },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('accountUpdateRole');
	});

	it('fails when role is equal to the requesting user role (privilege escalation prevention)', async () => {
		// ADMIN (4) trying to assign ADMIN (4) — not < 4
		const req = mockReq({
			body: { accountUpdateRole: String(Role.ADMIN) },
			account: { role: Role.ADMIN },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('accountUpdateRole');
	});

	it('fails when role is higher than the requesting user role', async () => {
		// MODERATOR (3) trying to assign ADMIN (4)
		const req = mockReq({
			body: { accountUpdateRole: String(Role.ADMIN) },
			account: { role: Role.MODERATOR },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('accountUpdateRole');
	});
});

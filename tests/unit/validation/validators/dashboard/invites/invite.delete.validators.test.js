import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../src/services/invites.service.js', () => ({
	default: {
		getByCode: vi.fn(),
	},
}));

import invitesService from '../../../../../../src/services/invites.service.js';
import validators from '../../../../../../src/validation/validators/dashboard/invites/invite.delete.validators.js';
import { Role } from '../../../../../../src/models/roles.js';
import { mockReq, runValidators, errorFields } from '../../../helpers.js';

const MODERATOR_ACCOUNT = { id: 'mod-1', role: Role.MODERATOR };
const USER_ACCOUNT = { id: 'user-1', role: Role.USER };

describe('invite.delete.validators', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes when invite is a personal invite owned by the requesting user', async () => {
		invitesService.getByCode.mockReturnValue({
			isSystemInvite: () => false,
			linkedAccount: { id: USER_ACCOUNT.id },
		});
		const req = mockReq({ body: { code: 'ABC123' }, account: USER_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes when invite is a system invite and requester has MANAGE_SYSTEM_INVITES permission', async () => {
		invitesService.getByCode.mockReturnValue({
			isSystemInvite: () => true,
			account: { id: 'other' },
		});
		const req = mockReq({ body: { code: 'SYSCODE1' }, account: MODERATOR_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when code field is missing', async () => {
		const req = mockReq({ body: {}, account: USER_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('code');
	});

	it('fails when invite is null (code not found)', async () => {
		invitesService.getByCode.mockReturnValue(null);
		const req = mockReq({ body: { code: 'NOTFOUND' }, account: USER_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('code');
	});

	it('fails when invite is a system invite but requester lacks permission', async () => {
		invitesService.getByCode.mockReturnValue({
			isSystemInvite: () => true,
			account: { id: 'some-account' },
		});
		const req = mockReq({ body: { code: 'SYSCODE1' }, account: USER_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('code');
	});

	it('fails when invite is a personal invite owned by a different user', async () => {
		invitesService.getByCode.mockReturnValue({
			isSystemInvite: () => false,
			linkedAccount: { id: 'another-user' },
		});
		const req = mockReq({ body: { code: 'ABC123' }, account: USER_ACCOUNT });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('code');
	});
});

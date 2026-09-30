import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../../src/services/launcher.service.js', () => ({
	checkKeyslotPassword: vi.fn(),
	getKeysSlots: vi.fn(),
}));

import { checkKeyslotPassword } from '../../../../../../../src/services/launcher.service.js';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/advanced/manage.advanced.encryption.add.validations.js';
import { mockReq, runValidators, errorFields, getErrors } from '../../../../helpers.js';

describe('manage.advanced.encryption.add.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with a valid current password, a name and a new password', async () => {
		checkKeyslotPassword.mockReturnValue(true);
		const req = mockReq({
			body: { passwordCurrent: 'current-password', name: 'My Keyslot', password: 'new-password' },
		});

		const result = await runValidators(validators, req);

		expect(checkKeyslotPassword).toHaveBeenCalledWith('current-password');
		expect(result.isEmpty()).toBe(false);
	});

	it('passes without a name because it is optional', async () => {
		checkKeyslotPassword.mockReturnValue(true);
		const req = mockReq({
			body: { passwordCurrent: 'current-password', password: 'new-password' },
		});

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(false);
	});

	it('fails when the current password is missing', async () => {
		const req = mockReq({ body: { password: 'new-password' } });

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('passwordCurrent');
		expect(checkKeyslotPassword).not.toHaveBeenCalled();
	});

	it('fails when the current password does not unlock a key slot', async () => {
		checkKeyslotPassword.mockReturnValue(false);
		const req = mockReq({
			body: { passwordCurrent: 'wrong-password', password: 'new-password' },
		});

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(false);
		expect(getErrors(result)).toContainEqual({
			field: 'passwordCurrent',
			msg: 'validation.password.incorrect',
		});
	});

	it('fails when the new password is missing', async () => {
		checkKeyslotPassword.mockReturnValue(true);
		const req = mockReq({ body: { passwordCurrent: 'current-password' } });

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('escapes the optional name field', async () => {
		checkKeyslotPassword.mockReturnValue(true);
		const req = mockReq({
			body: { passwordCurrent: 'current-password', name: '<script>', password: 'new-password' },
		});

		await runValidators(validators, req);

		expect(req.body.name).toBe('&lt;script&gt;');
	});
});

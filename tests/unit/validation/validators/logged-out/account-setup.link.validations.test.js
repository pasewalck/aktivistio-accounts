import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/services/account.service.js', () => ({
	default: {
		actionToken: {
			checkValid: vi.fn(),
		},
	},
}));

import accountService from '../../../../../src/services/account.service.js';
import validators from '../../../../../src/validation/validators/logged-out/account-setup.link.validations.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

describe('account-setup.link.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with a valid action token', async () => {
		accountService.actionToken.checkValid.mockReturnValue(true);
		const req = mockReq({ params: { actionToken: 'valid-token' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when actionToken param is missing', async () => {
		const req = mockReq({ params: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('actionToken');
	});

	it('fails when actionToken param is empty string', async () => {
		const req = mockReq({ params: { actionToken: '' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('actionToken');
	});

	it('fails when the action token is invalid', async () => {
		accountService.actionToken.checkValid.mockReturnValue(false);
		const req = mockReq({ params: { actionToken: 'expired-or-wrong-token' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('actionToken');
	});

	it('calls checkValid with the ACCOUNT_SETUP token type', async () => {
		accountService.actionToken.checkValid.mockReturnValue(true);
		const req = mockReq({ params: { actionToken: 'some-token' } });
		await runValidators(validators, req);
		expect(accountService.actionToken.checkValid).toHaveBeenCalledWith('account_setup', expect.any(String));
	});
});

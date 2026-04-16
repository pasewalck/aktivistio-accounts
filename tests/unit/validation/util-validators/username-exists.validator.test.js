import { describe, it, expect, vi, beforeEach } from 'vitest';
import { body } from 'express-validator';

vi.mock('../../../../src/services/account.service.js', () => ({
	default: {
		find: {
			withUsername: vi.fn(),
		},
	},
}));

import accountService from '../../../../src/services/account.service.js';
import usernameExistsValidator from '../../../../src/validation/util-validators/username-exists.validator.js';
import { mockReq, runValidators, errorFields } from '../helpers.js';

function makeValidators(field = 'username') {
	return [usernameExistsValidator(body(field))];
}

describe('username-exists.validator', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes when username exists in the database', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1, username: 'alice' });
		const req = mockReq({ body: { username: 'alice' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(true);
		expect(accountService.find.withUsername).toHaveBeenCalledWith('alice');
	});

	it('fails when username does not exist in the database', async () => {
		accountService.find.withUsername.mockReturnValue(null);
		const req = mockReq({ body: { username: 'nobody' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username field is missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username field is empty string', async () => {
		const req = mockReq({ body: { username: '' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('lowercases the username before looking it up', async () => {
		accountService.find.withUsername.mockReturnValue({ id: 1, username: 'alice' });
		const req = mockReq({ body: { username: 'ALICE' } });
		const result = await runValidators(makeValidators(), req);
		expect(accountService.find.withUsername).toHaveBeenCalledWith('alice');
		expect(result.isEmpty()).toBe(true);
	});
});

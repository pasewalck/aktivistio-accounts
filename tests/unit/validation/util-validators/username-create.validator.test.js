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
import usernameCreateValidator from '../../../../src/validation/util-validators/username-create.validator.js';
import { mockReq, runValidators, errorFields } from '../helpers.js';

function makeValidators(getAllowUsername = null) {
	return [usernameCreateValidator(body('username'), getAllowUsername)];
}

describe('username-create.validator', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default: username is not taken
		accountService.find.withUsername.mockReturnValue(null);
	});

	it('passes with a valid, available username', async () => {
		const req = mockReq({ body: { username: 'alice' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when username field is missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
		expect(accountService.find.withUsername).not.toHaveBeenCalled();
	});

	it('fails when username field is empty string', async () => {
		const req = mockReq({ body: { username: '' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username contains uppercase letters', async () => {
		const req = mockReq({ body: { username: 'Alice' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username contains non-alphanumeric characters', async () => {
		const req = mockReq({ body: { username: 'al-ice' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username is too short (< 2 chars)', async () => {
		const req = mockReq({ body: { username: 'a' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('fails when username is too long (> 14 chars)', async () => {
		const req = mockReq({ body: { username: 'averylongusername' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('passes at the minimum length boundary (2 chars)', async () => {
		const req = mockReq({ body: { username: 'ab' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes at the maximum length boundary (14 chars)', async () => {
		const req = mockReq({ body: { username: 'abcdefghijklmn' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when username is already taken', async () => {
		// username is taken
		accountService.find.withUsername.mockReturnValue({ id: 1, username: 'alice' });
		const req = mockReq({ body: { username: 'alice' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});

	it('passes when username matches the allowed username callback (same as current)', async () => {
		// This simulates an account-setup scenario where user keeps their existing username (username is taken by the current user)
		accountService.find.withUsername.mockReturnValue({ id: 1, username: 'alice' });
		const getAllowUsername = () => 'alice';
		const req = mockReq({ body: { username: 'alice' } });
		const result = await runValidators(makeValidators(getAllowUsername), req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when username is taken and does not match the allowed username callback', async () => {
		// username is taken
		accountService.find.withUsername.mockReturnValue({ id: 2, username: 'bob' });
		const getAllowUsername = () => 'alice';
		const req = mockReq({ body: { username: 'bob' } });
		const result = await runValidators(makeValidators(getAllowUsername), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('username');
	});
});

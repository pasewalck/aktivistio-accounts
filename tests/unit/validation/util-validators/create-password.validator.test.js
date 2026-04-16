import { describe, it, expect } from 'vitest';
import { body } from 'express-validator';
import createPasswordValidator from '../../../../src/validation/util-validators/create-password.validator.js';
import { mockReq, runValidators, errorFields } from '../helpers.js';

function makeValidators(field = 'password') {
	return [createPasswordValidator(body(field))];
}

const STRONG_PASSWORD = 'correct-horse-battery-staple';

describe('create-password.validator', () => {
	it('passes with a strong password', async () => {
		// zxcvbn score must be > 2
		const req = mockReq({ body: { password: STRONG_PASSWORD } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when password is missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when password is empty string', async () => {
		const req = mockReq({ body: { password: '' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when password contains non-ASCII characters', async () => {
		const req = mockReq({ body: { password: 'pässwörd123!' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails with a weak/common password (low zxcvbn score)', async () => {
		const req = mockReq({ body: { password: 'password' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails with a short numeric-only password', async () => {
		const req = mockReq({ body: { password: '123456' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});
});

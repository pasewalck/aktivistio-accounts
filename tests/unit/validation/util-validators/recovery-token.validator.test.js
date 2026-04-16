import { describe, it, expect } from 'vitest';
import { body } from 'express-validator';
import recoveryTokenValidator from '../../../../src/validation/util-validators/recovery-token.validator.js';
import { generateRecoveryToken } from '../../../../src/helpers/recovery-token-string.js';
import { mockReq, runValidators, errorFields } from '../helpers.js';

function makeValidators(field = 'token') {
	return [recoveryTokenValidator(body(field))];
}

const VALID_TOKEN = generateRecoveryToken();

describe('recovery-token.validator', () => {
	it('passes with a valid recovery token format', async () => {
		const req = mockReq({ body: { token: VALID_TOKEN } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when token is empty', async () => {
		const req = mockReq({ body: { token: '' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when token is missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});

	it('fails when token is invalid', async () => {
		const req = mockReq({ body: { token: 'Abc123' } });
		const result = await runValidators(makeValidators(), req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('token');
	});
});

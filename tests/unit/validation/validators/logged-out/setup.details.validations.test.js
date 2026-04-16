import { describe, it, expect } from 'vitest';
import validators from '../../../../../src/validation/validators/logged-out/setup.details.validations.js';
import { generateRecoveryToken } from '../../../../../src/helpers/recovery-token-string.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

const STRONG_PASSWORD = 'correct-horse-battery-staple';
const VALID_TOKEN = generateRecoveryToken();

function validTokenBody(overrides = {}) {
	return {
		password: STRONG_PASSWORD,
		passwordConfirm: STRONG_PASSWORD,
		recoveryMethod: 'token',
		recoveryToken: VALID_TOKEN,
		recoveryTokenVerify: true,
		...overrides,
	};
}

function validEmailBody(overrides = {}) {
	return {
		password: STRONG_PASSWORD,
		passwordConfirm: STRONG_PASSWORD,
		recoveryMethod: 'email',
		recoveryEmail: 'user@example.com',
		...overrides,
	};
}

describe('setup.details.validations', () => {
	it('passes with all valid fields using token recovery method', async () => {
		const req = mockReq({ body: validTokenBody() });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes with all valid fields using email recovery method', async () => {
		const req = mockReq({ body: validEmailBody() });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when recoveryMethod is missing', async () => {
		const req = mockReq({ body: validTokenBody({ recoveryMethod: undefined }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('recoveryMethod');
	});

	it('fails when recoveryMethod is an invalid value', async () => {
		const req = mockReq({ body: validTokenBody({ recoveryMethod: 'sms' }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('recoveryMethod');
	});

	it('fails when recoveryMethod is email but recoveryEmail is missing', async () => {
		const req = mockReq({ body: validEmailBody({ recoveryEmail: undefined }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('recoveryEmail');
	});

	it('fails when recoveryMethod is email but recoveryEmail has invalid format', async () => {
		const req = mockReq({ body: validEmailBody({ recoveryEmail: 'not-an-email' }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('recoveryEmail');
	});

	it('does not require recoveryEmail when recoveryMethod is token', async () => {
		const req = mockReq({ body: validTokenBody({ recoveryEmail: undefined }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when recoveryMethod is token but recoveryToken is missing', async () => {
		const req = mockReq({ body: validTokenBody({ recoveryToken: undefined }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('recoveryToken');
	});

	it('fails when recoveryMethod is token but recoveryToken has invalid format', async () => {
		const req = mockReq({ body: validTokenBody({ recoveryToken: 'bad-format' }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('recoveryToken');
	});

	it('does not require recoveryToken when recoveryMethod is email', async () => {
		const req = mockReq({ body: validEmailBody({ recoveryToken: undefined }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when recoveryMethod is token but recoveryTokenVerify is falsy', async () => {
		const req = mockReq({ body: validTokenBody({ recoveryTokenVerify: false }) });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('recoveryTokenVerify');
	});
});

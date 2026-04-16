import { describe, it, expect } from 'vitest';
import validators from '../../../../../src/validation/validators/logged-out/recovery.reset-step.validations.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

const STRONG_PASSWORD = 'correct-horse-battery-staple';

describe('recovery.reset-step.validations', () => {
	it('passes with a strong password and matching confirmation', async () => {
		const req = mockReq({
			body: { password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when password is missing', async () => {
		const req = mockReq({ body: { confirmPassword: STRONG_PASSWORD } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when password is weak', async () => {
		const req = mockReq({ body: { password: 'password', confirmPassword: 'password' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('password');
	});

	it('fails when confirmPassword is missing', async () => {
		const req = mockReq({ body: { password: STRONG_PASSWORD } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('confirmPassword');
	});

	it('fails when confirmPassword does not match password', async () => {
		const req = mockReq({
			body: { password: STRONG_PASSWORD, confirmPassword: 'different-password-value' },
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('confirmPassword');
	});

	it('fails when both fields are missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
	});
});

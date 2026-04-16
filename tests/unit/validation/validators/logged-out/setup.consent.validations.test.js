import { describe, it, expect } from 'vitest';
import validators from '../../../../../src/validation/validators/logged-out/setup.consent.validations.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

describe('setup.consent.validations', () => {
	it('passes when verify is a truthy string ("on")', async () => {
		const req = mockReq({ body: { verify: 'on' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when verify field is missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('verify');
	});
});

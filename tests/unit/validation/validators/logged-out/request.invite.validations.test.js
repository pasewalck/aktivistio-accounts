import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../src/services/invites.service.js', () => ({
	default: {
		requestWithEmail: vi.fn(),
	},
}));

// Mock env to control WHITELISTED_MAIL_PROVIDERS without loading real env/logger
vi.mock('../../../../../src/helpers/env.js', () => ({
	default: {
		WHITELISTED_MAIL_PROVIDERS: ['example.com'],
	},
}));

import invitesService from '../../../../../src/services/invites.service.js';
import validators from '../../../../../src/validation/validators/logged-out/request.invite.validations.js';
import { mockReq, runValidators, errorFields } from '../../helpers.js';

describe('request.invite.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default: email is not already used
		invitesService.requestWithEmail.mockResolvedValue(true);
	});

	it('passes with a valid, unused email and whitelist restriction', async () => {
		const req = mockReq({ body: { email: 'user@example.com' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails with a valid, unused email but email not on whitelist', async () => {
		const req = mockReq({ body: { email: 'user@not-example.com' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
	});

	it('fails when email is missing', async () => {
		const req = mockReq({ body: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when email is empty string', async () => {
		const req = mockReq({ body: { email: '' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when email has invalid format', async () => {
		const req = mockReq({ body: { email: 'not-an-email' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});

	it('fails when email has already been used for an invite request', async () => {
		invitesService.requestWithEmail.mockResolvedValue(false);
		const req = mockReq({ body: { email: 'used@example.com' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('email');
	});
});

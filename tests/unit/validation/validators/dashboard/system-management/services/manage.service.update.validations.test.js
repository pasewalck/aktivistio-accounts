import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../../src/services/account.service.js', () => ({
	default: {
		password: { check: vi.fn() },
	},
}));

vi.mock('../../../../../../../src/services/adapter.service.js', () => ({
	default: {
		getEntry: vi.fn(),
	},
}));

import accountService from '../../../../../../../src/services/account.service.js';
import adapterService from '../../../../../../../src/services/adapter.service.js';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/services/manage.service.update.validations.js';
import { mockReq, runValidators, errorFields } from '../../../../helpers.js';

const mockAccount = { id: 'admin-1' };
const validConfig = JSON.stringify({ client_id: 'my-client', client_secret: 'secret' });

describe('manage.service.update.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes with correct password and valid configuration (no ID conflict)', async () => {
		accountService.password.check.mockResolvedValue(true);
		adapterService.getEntry.mockReturnValue(null); // no conflict
		const req = mockReq({
			body: { adminPassword: 'correct-password', configuration: validConfig },
			params: { id: 'my-client' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('passes when existing entry has same id as params.id (updating same client)', async () => {
		accountService.password.check.mockResolvedValue(true);
		// Entry exists but it's the same client being updated
		adapterService.getEntry.mockReturnValue({ client_id: 'my-client' });
		const req = mockReq({
			body: { adminPassword: 'correct-password', configuration: validConfig },
			params: { id: 'my-client' }, // same id — no conflict
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when adminPassword is missing', async () => {
		const req = mockReq({
			body: { configuration: validConfig },
			params: { id: 'my-client' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('adminPassword');
	});

	it('fails when password is incorrect', async () => {
		accountService.password.check.mockResolvedValue(false);
		const req = mockReq({
			body: { adminPassword: 'wrong', configuration: validConfig },
			params: { id: 'my-client' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('adminPassword');
	});

	it('fails when configuration is missing', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { adminPassword: 'correct-password' },
			params: { id: 'my-client' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('configuration');
	});

	it('fails when configuration is not valid JSON (throws parse error)', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: { adminPassword: 'correct-password', configuration: 'not-json' },
			params: { id: 'my-client' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('configuration');
	});

	it('fails when configuration JSON is missing client_id', async () => {
		accountService.password.check.mockResolvedValue(true);
		const req = mockReq({
			body: {
				adminPassword: 'correct-password',
				configuration: JSON.stringify({ client_secret: 'secret' }),
			},
			params: { id: 'my-client' },
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('configuration');
	});

	it('fails when configuration has a client_id that conflicts with an existing different client', async () => {
		accountService.password.check.mockResolvedValue(true);
		adapterService.getEntry.mockReturnValue({ client_id: 'other-client' }); // conflict exists
		const req = mockReq({
			body: {
				adminPassword: 'correct-password',
				configuration: JSON.stringify({ client_id: 'other-client' }),
			},
			params: { id: 'my-client' }, // different from other-client
			account: mockAccount,
		});
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('configuration');
	});
});

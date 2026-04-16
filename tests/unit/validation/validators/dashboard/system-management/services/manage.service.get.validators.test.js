import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../../src/services/adapter.service.js', () => ({
	default: {
		getEntry: vi.fn(),
	},
}));

import adapterService from '../../../../../../../src/services/adapter.service.js';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/services/manage.service.get.validators.js';
import { mockReq, runValidators, errorFields } from '../../../../helpers.js';

describe('manage.service.get.validators', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes when client exists', async () => {
		adapterService.getEntry.mockReturnValue({ client_id: 'my-client' });
		const req = mockReq({ params: { id: 'my-client' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(true);
	});

	it('fails when id param is missing', async () => {
		const req = mockReq({ params: {} });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});

	it('fails when id param is empty string', async () => {
		const req = mockReq({ params: { id: '' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});

	it('fails when client does not exist', async () => {
		adapterService.getEntry.mockReturnValue(null);
		const req = mockReq({ params: { id: 'nonexistent-client' } });
		const result = await runValidators(validators, req);
		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('id');
	});

	it('calls getEntry with "Client" and the id value', async () => {
		adapterService.getEntry.mockReturnValue({ client_id: 'my-client' });
		const req = mockReq({ params: { id: 'my-client' } });
		await runValidators(validators, req);
		expect(adapterService.getEntry).toHaveBeenCalledWith('Client', expect.any(String));
	});
});

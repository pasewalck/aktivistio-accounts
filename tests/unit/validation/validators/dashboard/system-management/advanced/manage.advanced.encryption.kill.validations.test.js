import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../../../../src/services/launcher.service.js', () => ({
	checkKeyslotPassword: vi.fn(),
	getKeysSlots: vi.fn(),
}));

import { getKeysSlots } from '../../../../../../../src/services/launcher.service.js';
import validators from '../../../../../../../src/validation/validators/dashboard/system-management/advanced/manage.advanced.encryption.kill.validations.js';
import { mockReq, runValidators, errorFields, getErrors } from '../../../../helpers.js';

const keySlots = [
	{ idIndex: 0, name: 'Alpha' },
	{ idIndex: 1, name: 'Beta' },
];

describe('manage.advanced.encryption.kill.validations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getKeysSlots.mockReturnValue(keySlots);
	});

	it('passes when the id index matches an existing key slot', async () => {
		const req = mockReq({ body: { idIndex: '1' } });

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(true);
		expect(req.body.idIndex).toBe(1);
	});

	it('passes for the first key slot (id index 0)', async () => {
		const req = mockReq({ body: { idIndex: '0' } });

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(true);
		expect(req.body.idIndex).toBe(0);
	});

	it('fails when the id index is missing', async () => {
		const req = mockReq({ body: {} });

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('idIndex');
	});

	it('fails when the id index is not numeric', async () => {
		const req = mockReq({ body: { idIndex: 'not-a-number' } });

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(false);
		expect(errorFields(result)).toContain('idIndex');
	});

	it('fails when the id index does not match any key slot', async () => {
		const req = mockReq({ body: { idIndex: '99' } });

		const result = await runValidators(validators, req);

		expect(result.isEmpty()).toBe(false);
		expect(getErrors(result)).toContainEqual({
			field: 'idIndex',
			msg: 'validation.advanced.encryption.idIndex.invalid',
		});
	});
});

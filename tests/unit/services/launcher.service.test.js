import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadPasswordError } from 'encrypted-secret-launcher/src/errors/bad-password.error.js';
import { KeySlotRemoveError } from 'encrypted-secret-launcher/src/errors/keyslot-remove.error.js';
import { InternalError } from '../../../src/models/errors.js';

const { secretsInstance, SecretsMock } = vi.hoisted(() => {
	const secretsInstance = {
		keySlots: [],
		addKeySlot: vi.fn(),
		getKey: vi.fn(),
		removeKeySlot: vi.fn(),
		save: vi.fn(),
	};
	const SecretsMock = vi.fn(function () {
		return secretsInstance;
	});
	return { secretsInstance, SecretsMock };
});

vi.mock('encrypted-secret-launcher/src/secrets.js', () => ({
	Secrets: SecretsMock,
	KeySlot: class KeySlot {},
}));

import {
	addKeySlot,
	checkKeyslotPassword,
	removeKeySlot,
	getKeysSlots,
} from '../../../src/services/launcher.service.js';

describe('launcher.service', () => {
	beforeEach(() => {
		secretsInstance.addKeySlot.mockReset();
		secretsInstance.getKey.mockReset();
		secretsInstance.removeKeySlot.mockReset();
		secretsInstance.save.mockReset();
		secretsInstance.keySlots = [];
	});

	describe('addKeySlot', () => {
		it('adds the key slot, saves the store and returns true', () => {
			const result = addKeySlot('new-password', 'my-keyslot', 'current-password');

			expect(secretsInstance.addKeySlot).toHaveBeenCalledWith('new-password', 'my-keyslot', 'current-password');
			expect(secretsInstance.save).toHaveBeenCalledTimes(1);
			expect(result).toBe(true);
		});

		it('returns false when the current password is invalid', () => {
			secretsInstance.addKeySlot.mockImplementation(() => {
				throw new BadPasswordError();
			});

			const result = addKeySlot('new-password', 'my-keyslot', 'wrong-password');

			expect(result).toBe(false);
			expect(secretsInstance.save).not.toHaveBeenCalled();
		});
	});

	describe('checkKeyslotPassword', () => {
		it('returns true and saves the store when the password unlocks a key slot', () => {
			const result = checkKeyslotPassword('current-password');

			expect(secretsInstance.getKey).toHaveBeenCalledWith('current-password');
			expect(secretsInstance.save).toHaveBeenCalledTimes(1);
			expect(result).toBe(true);
		});

		it('returns false when the password is invalid', () => {
			secretsInstance.getKey.mockImplementation(() => {
				throw new BadPasswordError();
			});

			const result = checkKeyslotPassword('wrong-password');

			expect(result).toBe(false);
			expect(secretsInstance.save).not.toHaveBeenCalled();
		});

		it('wraps unexpected errors in an InternalError', () => {
			secretsInstance.getKey.mockImplementation(() => {
				throw new Error('unexpected');
			});

			expect(() => checkKeyslotPassword('current-password')).toThrow(InternalError);
		});
	});

	describe('removeKeySlot', () => {
		it('removes the key slot, saves the store and returns true', () => {
			const result = removeKeySlot(1);

			expect(secretsInstance.removeKeySlot).toHaveBeenCalledWith(1);
			expect(secretsInstance.save).toHaveBeenCalledTimes(1);
			expect(result).toBe(true);
		});

		it('returns false when removing the last remaining key slot', () => {
			secretsInstance.removeKeySlot.mockImplementation(() => {
				throw new KeySlotRemoveError();
			});

			const result = removeKeySlot(0);

			expect(result).toBe(false);
			expect(secretsInstance.save).not.toHaveBeenCalled();
		});

		it('wraps unexpected errors in an InternalError', () => {
			secretsInstance.removeKeySlot.mockImplementation(() => {
				throw new Error('unexpected');
			});

			expect(() => removeKeySlot(1)).toThrow(InternalError);
		});
	});

	describe('getKeysSlots', () => {
		it('returns the key slots from the secret store', () => {
			const keySlots = [{ idIndex: 0, name: 'Alpha' }];
			secretsInstance.keySlots = keySlots;

			expect(getKeysSlots()).toBe(keySlots);
		});
	});
});

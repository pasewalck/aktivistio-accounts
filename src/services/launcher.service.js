import { BadPasswordError } from 'encrypted-secret-launcher/src/errors/bad-password.error.js';
import { KeySlotRemoveError } from 'encrypted-secret-launcher/src/errors/keyslot-remove.error.js';
import { KeySlot, Secrets } from 'encrypted-secret-launcher/src/secrets.js'; // eslint-disable-line
import { InternalError } from '../models/errors.js';

const secrets = new Secrets('data/database-secrets.json', []);

/**
 * @description Adds a new key slot protected by the given password and persists the secret store.
 * @param {String} password - The password that will unlock the new key slot.
 * @param {String} name - The display name for the new key slot.
 * @param {String} currentPassword - The password of an existing key slot used to unlock the store.
 * @returns {Boolean} - True if the key slot was added, false if the current password is invalid.
 * @throws {InternalError} - If an unexpected error occurs while adding the key slot.
 */
export function addKeySlot(password, name, currentPassword) {
	try {
		secrets.addKeySlot(password, name, currentPassword);
		secrets.save();
		return true;
	} catch (error) {
		if (error instanceof BadPasswordError) {
			return false;
		} else {
			throw new InternalError(error);
		}
	}
}

/**
 * @description Checks whether the given password can unlock a key slot and persists the secret store.
 * @param {String} password - The password to validate against the existing key slots.
 * @returns {Boolean} - True if the password unlocks a key slot, false otherwise.
 * @throws {InternalError} - If an unexpected error occurs while checking the password.
 */
export function checkKeyslotPassword(password) {
	try {
		secrets.getKey(password);
		secrets.save();
		return true;
	} catch (error) {
		if (error instanceof BadPasswordError) {
			return false;
		} else {
			throw new InternalError(error);
		}
	}
}

/**
 * @description Removes a key slot by its id index and persists the secret store.
 * @param {number} idIndex - The id index of the key slot to remove.
 * @returns {Boolean} - True if the key slot was removed, false if it is the last remaining key slot.
 * @throws {InternalError} - If an unexpected error occurs while removing the key slot.
 */
export function removeKeySlot(idIndex) {
	try {
		secrets.removeKeySlot(idIndex);
		secrets.save();

		return true;
	} catch (error) {
		if (error instanceof KeySlotRemoveError) {
			return false;
		} else {
			throw new InternalError(error);
		}
	}
}

/**
 * @description Retrieves all key slots currently held in the secret store.
 * @returns {Array<KeySlot>} - The list of key slots.
 */
export function getKeysSlots() {
	return secrets.keySlots;
}

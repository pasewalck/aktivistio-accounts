import { BadPasswordError } from 'encrypted-secret-launcher/src/errors/bad-password.error.js';
import { KeySlotRemoveError } from 'encrypted-secret-launcher/src/errors/keyslot-remove.error.js';
import { KeySlot, Secrets } from 'encrypted-secret-launcher/src/secrets.js'; // eslint-disable-line
import { InternalError } from '../models/errors.js';

const secrets = new Secrets('data/database-secrets.json', []);

/**
 * @description
 * @param {String} password
 * @param {String} name
 * @param {String} currentPassword
 * @returns {Boolean}
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
 * @description
 * @param {String} password
 * @returns {Boolean}
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
 * @description
 * @param {number} idIndex
 * @returns {Boolean}
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
 * @description
 * @returns {Array<KeySlot>}
 */
export function getKeysSlots() {
	return secrets.keySlots;
}

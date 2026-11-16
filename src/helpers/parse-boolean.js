const TRUE_VALUES = ['true', '1', 'yes', 'on'];
const FALSE_VALUES = ['false', '0', 'no', 'off', ''];

/**
 * @description Parse an environment-style boolean value.
 * Accepts the common truthy and falsy string representations used in environment files.
 * @param {String|Boolean} value - The value to parse.
 * @returns {Boolean} The parsed boolean value.
 * @throws {TypeError} If the value is not a recognized boolean representation.
 */
export function parseBoolean(value) {
	if (typeof value === 'boolean') return value;
	if (typeof value !== 'string') {
		throw new TypeError(`Expected a string or boolean, received ${typeof value}`);
	}

	const normalized = value.trim().toLowerCase();

	if (TRUE_VALUES.includes(normalized)) return true;
	if (FALSE_VALUES.includes(normalized)) return false;

	throw new TypeError(`Invalid boolean value "${value}". Expected one of: true, false, 1, 0, yes, no, on, off.`);
}

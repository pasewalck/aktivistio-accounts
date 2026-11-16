import { describe, it, expect } from 'vitest';
import { parseBoolean } from '../../../src/helpers/parse-boolean.js';

describe('parseBoolean', () => {
	it.each(['true', 'TRUE', 'True', ' true ', '1', 'yes', 'YES', 'on', 'ON'])('should parse "%s" as true', (value) => {
		expect(parseBoolean(value)).toBe(true);
	});

	it.each(['false', 'FALSE', 'False', ' false ', '0', 'no', 'NO', 'off', 'OFF', '', '   '])(
		'should parse "%s" as false',
		(value) => {
			expect(parseBoolean(value)).toBe(false);
		}
	);

	it('should return boolean values unchanged', () => {
		expect(parseBoolean(true)).toBe(true);
		expect(parseBoolean(false)).toBe(false);
	});

	it('should throw for unrecognized values', () => {
		expect(() => parseBoolean('maybe')).toThrow(TypeError);
		expect(() => parseBoolean('2')).toThrow('Invalid boolean value "2"');
	});

	it('should throw for non-string, non-boolean values', () => {
		expect(() => parseBoolean(1)).toThrow(TypeError);
		expect(() => parseBoolean(null)).toThrow(TypeError);
		expect(() => parseBoolean(undefined)).toThrow(TypeError);
	});
});

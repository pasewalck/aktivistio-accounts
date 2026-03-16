import { describe, it, expect } from 'vitest';
import {
	generateAlphanumericSecret,
	generatePassword,
	generateNumberCode,
	generateTypeableCode,
	generateAsciiSecret,
	getRandomCharFromStrings,
	getRandomCharFromString,
} from '../../../src/helpers/generate-secrets.js';
import { AlphanumericMoreReadable } from '../../../src/helpers/character-arrays.js';

const readableChars = Object.values(AlphanumericMoreReadable).join('');
const readableSet = new Set(readableChars);

function expectOnlyAllowedChars(str, allowed) {
	expect([...str].every((c) => allowed.has(c))).toBe(true);
}

describe('random char helpers', () => {
	describe('getRandomCharFromString', () => {
		it('returns a character from the provided string', () => {
			const chars = 'ABC';
			const result = getRandomCharFromString(chars);

			expect(chars).toContain(result);
			expect(result.length).toBe(1);
		});

		it('throws for empty string', () => {
			expect(() => getRandomCharFromString('')).toThrow();
		});

		it('can produce all characters eventually', () => {
			const chars = 'ABC';
			const seen = new Set();

			for (let i = 0; i < 500; i++) {
				seen.add(getRandomCharFromString(chars));
			}

			expect(seen.size).toBe(chars.length);
		});
	});

	describe('getRandomCharFromStrings', () => {
		it('returns a character from one of the provided strings', () => {
			const strings = ['ABC', '123'];
			const result = getRandomCharFromStrings(strings);

			expect('ABC123').toContain(result);
		});

		it('throws for empty array', () => {
			expect(() => getRandomCharFromStrings([])).toThrow();
		});
	});
});

describe('generateAlphanumericSecret', () => {
	it('generates specified length', () => {
		expect(generateAlphanumericSecret(16).length).toBe(16);
	});

	it('contains only alphanumeric characters', () => {
		const result = generateAlphanumericSecret(100);
		expect(/^[0-9a-zA-Z]+$/.test(result)).toBe(true);
	});

	it('uses readable charset when enabled', () => {
		const result = generateAlphanumericSecret(100, true);
		expectOnlyAllowedChars(result, readableSet);
	});
});

describe('generatePassword', () => {
	it('generates specified length', () => {
		expect(generatePassword(32).length).toBe(32);
	});

	it('uses readable characters only', () => {
		const result = generatePassword(100);
		expectOnlyAllowedChars(result, readableSet);
	});
});

describe('generateNumberCode', () => {
	it('generates specified length', () => {
		expect(generateNumberCode(6).length).toBe(6);
	});

	it('contains only digits', () => {
		expect(/^[0-9]+$/.test(generateNumberCode(100))).toBe(true);
	});

	it('throws for invalid length', () => {
		expect(() => generateNumberCode(0)).toThrow();
		expect(() => generateNumberCode(-1)).toThrow();
	});
});

describe('generateTypeableCode', () => {
	it('generates specified length', () => {
		expect(generateTypeableCode(12).length).toBe(12);
	});

	it('uses readable characters only', () => {
		const result = generateTypeableCode(100);
		expectOnlyAllowedChars(result, readableSet);
	});

	it('throws for invalid length', () => {
		expect(() => generateTypeableCode(0)).toThrow();
		expect(() => generateTypeableCode(-1)).toThrow();
	});

	it('throws for invalid ratio', () => {
		expect(() => generateTypeableCode(8, -1)).toThrow();
		expect(() => generateTypeableCode(8, 11)).toThrow();
	});

	it('respects custom ratio', () => {
		const result = generateTypeableCode(100, 0);
		expect(/[A-Za-z]/.test(result)).toBe(true);
	});
});

describe('generateAsciiSecret', () => {
	it('generates specified length', () => {
		expect(generateAsciiSecret(16).length).toBe(16);
	});
});

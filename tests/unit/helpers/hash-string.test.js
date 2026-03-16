import { describe, it, expect } from 'vitest';
import { hashString, hashPassword, isHashValid } from '../../../src/helpers/hash-string.js';

describe('hashString', () => {
	it('should hash a string and return a non-empty string', async () => {
		const result = await hashString('test-password');
		expect(result).toBeTypeOf('string');
		expect(result.length).toBeGreaterThan(0);
	});

	it('should produce different hashes for the same input (salt)', async () => {
		const password = 'test-password';
		const hash1 = await hashString(password);
		const hash2 = await hashString(password);
		expect(hash1).not.toBe(hash2);
	});

	it('should produce different hashes for different inputs', async () => {
		const hash1 = await hashString('password1');
		const hash2 = await hashString('password2');
		expect(hash1).not.toBe(hash2);
	});

	it('should use custom rounds when provided', async () => {
		const result = await hashString('test', 5);
		expect(result).toBeTypeOf('string');
	});
});

describe('hashPassword', () => {
	it('should hash a password using default rounds (12)', async () => {
		const result = await hashPassword('my-secure-password');
		expect(result).toBeTypeOf('string');
		expect(result.length).toBeGreaterThan(0);
	});

	it('should produce different hashes for the same password', async () => {
		const password = 'my-secure-password';
		const hash1 = await hashPassword(password);
		const hash2 = await hashPassword(password);
		expect(hash1).not.toBe(hash2);
	});
});

describe('isHashValid', () => {
	it('should return true for valid string/hash pair', async () => {
		const password = 'test-password';
		const hash = await hashPassword(password);
		const result = await isHashValid(password, hash);
		expect(result).toBe(true);
	});

	it('should return false for invalid string/hash pair', async () => {
		const hash = await hashPassword('correct-password');
		const result = await isHashValid('wrong-password', hash);
		expect(result).toBe(false);
	});

	it('should return false for empty string with valid hash', async () => {
		const hash = await hashPassword('password');
		const result = await isHashValid('', hash);
		expect(result).toBe(false);
	});
});

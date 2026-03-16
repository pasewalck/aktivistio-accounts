import { describe, it, expect } from 'vitest';
import { generateRecoveryToken, isRecoveryToken, TOKEN_TEMPLATE } from '../../../src/helpers/recovery-token-string.js';

describe('recovery-token-string', () => {
	describe('generateRecoveryToken', () => {
		it('should generate a token with the correct format', () => {
			const token = generateRecoveryToken();
			const regex = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){4}$/;
			expect(token).toMatch(regex);
		});
	});

	describe('isRecoveryToken', () => {
		it('should return true for valid recovery token', () => {
			const token = generateRecoveryToken();
			expect(isRecoveryToken(token)).toBe(true);
		});

		it('should return false for string with wrong length', () => {
			expect(isRecoveryToken('abc')).toBe(false);
		});
	});
});

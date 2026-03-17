import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['tests/**/*.test.js'],
		env: {
			BASE_URL: 'http://localhost:3000',
			PORT: 3000,
			SUPERADMIN_DEFAULT_PASSWORD: 'admin',
			DEBUG_DATABASE: true,
			IS_SECURE_CONTEXT: false,
		},
	},
});

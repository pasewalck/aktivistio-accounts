import js from '@eslint/js';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
	js.configs.recommended,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			ecmaVersion: 2025,
			sourceType: 'module',
			globals: {
				...globals.node,
			},
		},
		rules: {
			'no-console': 'warn',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
		ignores: ['node_modules/', '.github/'],
	},
];

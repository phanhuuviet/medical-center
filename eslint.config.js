// eslint.config.js
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                process: 'readonly',
                console: 'readonly',
            },
        },
        plugins: {
            prettier,
            import: importPlugin,
            'unused-imports': unusedImports,
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'unused-imports/no-unused-imports': 'warn', // Automatically remove unused imports
            'unused-imports/no-unused-vars': ['warn', { vars: 'all', args: 'after-used', argsIgnorePattern: '^_' }],
        },
    },
];

import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

// Next.js specific configuration
const nextFlatConfig = {
  plugins: {
    '@next/next': nextPlugin,
  },
  rules: {
    // Next.js recommended rules
    ...(nextPlugin.configs.recommended?.rules ?? {}),
    ...(nextPlugin.configs['core-web-vitals']?.rules ?? {}),

    // Additional Next.js 14 specific rules
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'error',
    '@next/next/no-page-custom-font': 'warn',
    '@next/next/google-font-display': 'warn',
    '@next/next/google-font-preconnect': 'warn',
  },
};

export default [
  nextFlatConfig,
  // Base configuration
  js.configs.recommended,

  // Ignore patterns
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.husky/**',
      'public/**',
      // Temporarily ignore test files
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/__test__/**',
      '**/__tests__/**',
      '**/jest.setup.ts',
    ],
  },

  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Node.js globals
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // React globals
        React: 'readonly',
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      'react-hooks': reactHooks,
      react: react,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // TypeScript rules
      ...typescript.configs.recommended.rules,
      // Downgrade to warning to avoid blocking development on explicit any
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Import rules với simple-import-sort
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports
            [String.raw`^\u0000`],
            // Node.js builtins
            ['^node:'],
            // External packages
            [String.raw`^@?\w`],
            // Internal packages (alias @/)
            ['^@/'],
            // Parent imports
            [String.raw`^\.\.(?!/?$)`, String.raw`^\.\./?$`],
            // Other relative imports
            [String.raw`^\./(?=.*/)(?!/?$)`, String.raw`^\.(?!/?$)`, String.raw`^\./?$`],
            // Style imports
            [String.raw`^.+\.s?css$`],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/no-duplicates': 'error',

      // Remove slow/redundant import rules (TypeScript handles these better)
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/default': 'off',

      // Keep useful import rules
      'import/no-absolute-path': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+
      'react/prop-types': 'off', // Using TypeScript
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-uses-react': 'off', // Not needed in Next.js 13+
      'react/jsx-uses-vars': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-unescaped-entities': 'off', // Next.js handles this

      // React Hooks rules (with Recoil support)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)',
        },
      ],

      // General JavaScript rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'eol-last': ['error', 'always'],

      // Formatting rules - Let Prettier handle these (removed conflicts)
      'comma-dangle': 'off',
      semi: 'off',
      quotes: 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'computed-property-spacing': 'off',
      'key-spacing': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },

  // Configuration for test files
  {
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/__test__/**',
      '**/__tests__/**',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        // Disable type-checking for tests (performance boost)
        project: null,
      },
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly', // For Vitest if used
        // Browser APIs used in tests
        HTMLFormElement: 'readonly',
        HTMLInputElement: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Storage: 'readonly',
        RequestInit: 'readonly',
      },
    },
    rules: {
      // Allow console in tests
      'no-console': 'off',
      // Allow any in tests for mocking
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow non-null assertions in tests
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow unused vars in tests (for mocking)
      '@typescript-eslint/no-unused-vars': 'off',
      // Disable ALL type-aware rules in tests (critical for performance)
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },

  // Configuration for config files
  {
    files: [
      'next.config.mjs',
      'jest.config.js',
      'jest.setup.ts',
      'postcss.config.cjs',
      'commitlint.config.mjs',
      'eslint.config.mjs',
      'tailwind.config.ts',
      '.prettierrc.mjs',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: null,
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        console: 'readonly',
        // Browser APIs for config files
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      // Disable rules that require type information for config files
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      // Allow console in config files
      'no-console': 'off',
      // Allow require in config files
      'import/no-commonjs': 'off',
    },
  },

  // Prettier configuration (should be last)
  prettier,
];

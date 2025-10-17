const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'ci',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'users',
        'products',
        'shared',
        'http',
        'state',
        'ui',
        'config',
        'docs',
        'ci',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'header-max-length': [2, 'always', 100],
  },
};

export default config;

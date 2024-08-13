import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: [
      '!**/*',
      'src/assets/http-server.ts',
      'src/assets/websocket-server.ts',
      'src/assets/server-sent-event-server.ts'
    ]
  },
  {
    files: ['**/*.ts'],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        tsconfigRootDir:
          '/mnt/w/public_html/24vlh/angular-tools/projects/angular-tools-test',
        project: ['tsconfig.app.json', 'tsconfig.spec.json'],
        createDefaultProgram: true
      }
    },

    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ],

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ]
    }
  },
  {
    files: ['**/*.html'],
    rules: {}
  }
];

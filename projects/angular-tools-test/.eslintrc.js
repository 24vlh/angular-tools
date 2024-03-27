module.exports = {
  extends: '../../.eslintrc.json',
  ignorePatterns: [
    '!**/*',
    'src/assets/websocket-server.ts',
    'src/assets/server-sent-event-server.ts'
  ],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['tsconfig.app.json', 'tsconfig.spec.json'],
        createDefaultProgram: true
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
      files: ['*.html'],
      rules: {}
    }
  ]
};

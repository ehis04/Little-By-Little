const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  { ignores: ['dist/*', '.expo/*', 'node_modules/*'] },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    // Text is the only way to render text (docs/02 section 6). Only the Text component itself may use the raw one.
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/ui/Text.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text'],
              message: "Use Text from '@/ui/Text'.",
            },
          ],
        },
      ],
    },
  },
];

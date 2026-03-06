import js from '@eslint/js'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginPrettier from 'eslint-plugin-prettier'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'pages/coupon/切版/**'],
  },
  js.configs.recommended,
  pluginReactHooks.configs.flat.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  // 所有檔案共用
  {
    plugins: {
      prettier: pluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      // exhaustive-deps / set-state-in-effect: 已在 Phase 6 清理真正的 bug，
      // 剩餘 65 個均為合理 side effect（data fetch、URL sync、prop init）→ 關閉
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/no-direct-set-state-in-use-effect': 'off',
      // a11y：降噪，遷移完成後再逐步收緊
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'prettier/prettier': 'warn',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // TypeScript：只套用於 .ts / .tsx 檔案（放在最後以覆蓋全域規則）
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 使用 @typescript-eslint/no-unused-vars 取代，避免誤判 TS 型別標記中的參數名稱
      'no-unused-vars': 'off',
      // TypeScript 自行處理 undefined 型別，關閉 no-undef 避免誤判 Web API 型別
      'no-undef': 'off',
    },
  },
]

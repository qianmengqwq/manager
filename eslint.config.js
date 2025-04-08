// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'eslint-comments/no-unlimited-disable': 'off',
    'no-lone-blocks': 'off',
    'style/multiline-ternary': 'off',
    'no-console': 'off',
  },
})

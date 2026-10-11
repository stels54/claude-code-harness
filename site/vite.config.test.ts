import { expect, test } from 'vitest'
import config from './vite.config.ts'

test('base совпадает с адресом GitHub Pages', () => {
  expect(config.base).toBe('/claude-code-harness/')
})

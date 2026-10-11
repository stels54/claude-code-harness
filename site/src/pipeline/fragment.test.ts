import { expect, test } from 'vitest'
import { extractFragment } from './fragment.ts'

const raw = 'a\n## X\nl1\nl2\n\n## Y\nz'

test('фрагмент между маркерами без хвостовых пустых строк', () => {
  expect(extractFragment(raw, '## X', '## Y')).toEqual({
    text: '## X\nl1\nl2',
    fromLine: 2,
    toLine: 4,
  })
})

test('без маркера конца — до конца файла', () => {
  expect(extractFragment(raw, '## Y', null)).toEqual({
    text: '## Y\nz',
    fromLine: 6,
    toLine: 7,
  })
})

test('маркер конца до начала не учитывается', () => {
  expect(extractFragment('## Y\n## X\nl\n## Y', '## X', '## Y')).toEqual({
    text: '## X\nl',
    fromLine: 2,
    toLine: 3,
  })
})

test('нет маркера начала — ошибка', () => {
  expect(() => extractFragment(raw, '## Q', '## Y')).toThrow('## Q')
})

test('нет маркера конца после начала — ошибка', () => {
  expect(() => extractFragment('## X\nl', '## X', '## Y')).toThrow('## Y')
})

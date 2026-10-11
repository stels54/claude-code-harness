export interface Fragment {
  text: string
  fromLine: number
  toLine: number
}

export function extractFragment(
  raw: string,
  start: string,
  end: string | null,
): Fragment {
  const lines = raw.split('\n')
  const from = lines.findIndex((line) => line.startsWith(start))
  if (from === -1) throw new Error(`Маркер начала не найден: ${start}`)

  let to = lines.length
  if (end !== null) {
    const rel = lines.slice(from + 1).findIndex((line) => line.startsWith(end))
    if (rel === -1) throw new Error(`Маркер конца не найден после «${start}»: ${end}`)
    to = from + 1 + rel
  }

  while (to > from + 1 && lines[to - 1].trim() === '') to--

  return {
    text: lines.slice(from, to).join('\n'),
    fromLine: from + 1,
    toLine: to,
  }
}

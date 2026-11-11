/** Display names for `solutions[].language`; unknown ids show as-is. */
const LABELS: Record<string, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  swift: 'Swift',
  sql: 'SQL',
}

export function languageLabel(id: string): string {
  return LABELS[id] ?? id
}

/** Unique language labels of a problem's solutions, in order. */
export function languageList(solutions: { language: string }[]): string {
  return [...new Set(solutions.map((s) => languageLabel(s.language)))].join(' · ')
}

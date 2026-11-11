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

/** Source file extension per language id; also the list `lc:add` accepts. */
export const EXTENSIONS: Record<string, string> = {
  python: 'py',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'cs',
  javascript: 'js',
  typescript: 'ts',
  go: 'go',
  rust: 'rs',
  kotlin: 'kt',
  swift: 'swift',
  sql: 'sql',
}

export function languageLabel(id: string): string {
  return LABELS[id] ?? id
}

/** Unique language labels of a problem's solutions, in order. */
export function languageList(solutions: { language: string }[]): string {
  return [...new Set(solutions.map((s) => languageLabel(s.language)))].join(' · ')
}

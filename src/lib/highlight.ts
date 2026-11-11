import hljs from 'highlight.js/lib/core'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import kotlin from 'highlight.js/lib/languages/kotlin'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'

// Only the languages in languages.ts, to keep the bundle small.
const LANGS = { c, cpp, csharp, go, java, javascript, kotlin, python, rust, sql, swift, typescript }
for (const [name, lang] of Object.entries(LANGS)) hljs.registerLanguage(name, lang)

/** Highlighted HTML (escaped by highlight.js); plain-escaped for unknown languages. */
export function highlight(code: string, language: string): string {
  if (hljs.getLanguage(language)) return hljs.highlight(code, { language }).value
  return code.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]!)
}

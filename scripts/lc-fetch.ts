/**
 * Fetches one LeetCode problem's metadata (the problem-level fields of
 * meta.json) by number or slug, using the Premium session in .env.
 *
 *   pnpm lc:fetch 232
 *   pnpm lc:fetch implement-queue-using-stacks
 *
 * Prints JSON to stdout. Never prints the cookies.
 */
import type { Difficulty, ProblemMeta } from '../src/lib/types.ts'

export type FetchedProblem = Omit<ProblemMeta, 'solutions'>

export class LeetCodeError extends Error {}

const ENDPOINT = 'https://leetcode.com/graphql/'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
/** Pause between the two requests of one lookup, to stay a light user. */
const REQUEST_GAP_MS = 1000

interface Credentials {
  session: string
  csrf?: string
}

interface QuestionNode {
  questionFrontendId: string
  title: string
  titleSlug: string
  difficulty: string
  topicTags: { name: string }[]
  companyTagStats: string | null
}

type CompanyStat = { name: string; timesEncountered?: number }

/** Only the companies that ask a problem most are worth keeping. */
export const TOP_COMPANIES = 5

/**
 * `companyTagStats` is a JSON string of time buckets ("1", "2", "3"), each a
 * list of companies. Returns the TOP_COMPANIES names asked most often overall.
 */
export function parseCompanies(stats: string | null): string[] {
  if (!stats) return []
  const buckets = JSON.parse(stats) as Record<string, CompanyStat[]>
  const totals = new Map<string, number>()
  for (const list of Object.values(buckets)) {
    for (const c of list) totals.set(c.name, (totals.get(c.name) ?? 0) + (c.timesEncountered ?? 0))
  }
  return [...totals]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_COMPANIES)
    .map(([name]) => name)
}

export function toProblem(q: QuestionNode): FetchedProblem {
  if (!['Easy', 'Medium', 'Hard'].includes(q.difficulty)) {
    throw new LeetCodeError(`unexpected difficulty ${JSON.stringify(q.difficulty)}`)
  }
  return {
    id: Number(q.questionFrontendId),
    slug: q.titleSlug,
    title: q.title,
    difficulty: q.difficulty as Difficulty,
    topics: q.topicTags.map((t) => t.name),
    companies: parseCompanies(q.companyTagStats),
    url: `https://leetcode.com/problems/${q.titleSlug}/`,
  }
}

async function graphql<T>(creds: Credentials, query: string, variables: object): Promise<T> {
  const cookie = [`LEETCODE_SESSION=${creds.session}`, creds.csrf && `csrftoken=${creds.csrf}`]
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      Referer: 'https://leetcode.com/',
      Origin: 'https://leetcode.com',
      Cookie: cookie.filter(Boolean).join('; '),
      ...(creds.csrf ? { 'x-csrftoken': creds.csrf } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new LeetCodeError(`LeetCode responded HTTP ${res.status}`)
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (body.errors?.length) throw new LeetCodeError(body.errors.map((e) => e.message).join('; '))
  return body.data as T
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function slugFor(creds: Credentials, id: number): Promise<string> {
  const data = await graphql<{ questionList: { data: QuestionNode[] } }>(
    creds,
    `
      query q($kw: String!) {
        questionList(categorySlug: "", limit: 20, skip: 0, filters: { searchKeywords: $kw }) {
          data {
            questionFrontendId
            titleSlug
          }
        }
      }
    `,
    { kw: String(id) },
  )
  const hit = data.questionList.data.find((q) => Number(q.questionFrontendId) === id)
  if (!hit) throw new LeetCodeError(`no LeetCode problem #${id}`)
  return hit.titleSlug
}

/** `ref` is a problem number ("232") or slug ("implement-queue-using-stacks"). */
export async function fetchProblem(ref: string, creds: Credentials): Promise<FetchedProblem> {
  let slug = ref.trim()
  if (/^\d+$/.test(slug)) {
    slug = await slugFor(creds, Number(slug))
    await sleep(REQUEST_GAP_MS)
  }
  // userStatus rides along: an expired session doesn't error, it just
  // returns null company tags, which would silently save "no companies".
  const data = await graphql<{
    userStatus: { isSignedIn: boolean; isPremium: boolean | null }
    question: QuestionNode | null
  }>(
    creds,
    `
      query q($slug: String!) {
        userStatus {
          isSignedIn
          isPremium
        }
        question(titleSlug: $slug) {
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
          companyTagStats
        }
      }
    `,
    { slug },
  )
  if (!data.userStatus.isSignedIn) {
    throw new LeetCodeError(
      'LEETCODE_SESSION has expired or is wrong. Log in on leetcode.com, copy the cookie again into .env.',
    )
  }
  if (!data.userStatus.isPremium) {
    throw new LeetCodeError('This account is not Premium, so company tags are unavailable.')
  }
  if (!data.question) throw new LeetCodeError(`no LeetCode problem "${slug}"`)
  return toProblem(data.question)
}

function credentialsFromEnv(): Credentials {
  try {
    process.loadEnvFile('.env')
  } catch {
    // No .env: fall through to the check below.
  }
  const session = process.env.LEETCODE_SESSION?.trim()
  if (!session) {
    throw new LeetCodeError(
      'LEETCODE_SESSION is not set. Copy .env.example to .env and fill it in.',
    )
  }
  return { session, csrf: process.env.LEETCODE_CSRFTOKEN?.trim() || undefined }
}

if (import.meta.main) {
  const ref = process.argv[2]
  if (!ref) {
    console.error('Usage: pnpm lc:fetch <number | slug>')
    process.exit(2)
  }
  try {
    console.log(JSON.stringify(await fetchProblem(ref, credentialsFromEnv()), null, 2))
  } catch (err) {
    console.error(err instanceof LeetCodeError ? err.message : err)
    process.exit(1)
  }
}

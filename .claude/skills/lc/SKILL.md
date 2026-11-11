---
name: lc
description: Save a LeetCode solution to this site. Use when HD types /lc with a problem number or slug (e.g. "/lc 232"), or asks to add, record or save a solved LeetCode problem. Fetches the problem from LeetCode, asks HD for the code, then writes data/problems/<id>/ and commits.
---

# /lc — save a LeetCode solution

Talk to HD in Chinese. Everything below runs from the repo root.

## 1. Identify the problem

- Argument is a number (`232`) or slug (`implement-queue-using-stacks`). None given: ask which problem.
- Already saved (`data/problems/<id>/meta.json` exists, or a meta with that slug)? Read it and show HD the title, difficulty and the solutions already there. Do **not** call LeetCode.
- Not saved: fetch once and keep the output for step 5:
  ```bash
  TMP=$(mktemp -d)
  pnpm -s lc:fetch <ref> > "$TMP/meta.json"
  ```
  Show HD: `#id title`, difficulty, topics, companies.
- If it fails with an expired or missing `LEETCODE_SESSION`: `open https://leetcode.com`, tell HD to copy `LEETCODE_SESSION` (and `csrftoken`) from DevTools → Application → Cookies **straight into `.env`**. Never ask HD to paste cookies into the chat, and never print `.env`.

## 2. Ask for the code

Ask HD to paste the solution (one or more). Also accept, if HD mentions them: a note (complexity, idea) and a solve date other than today. Don't ask for anything else.

## 3. Work out language, approach and file name

- **Language**: from the code. Must be one of the ids in `EXTENSIONS` in `src/lib/languages.ts` (`python`, `java`, `cpp`, `c`, `csharp`, `javascript`, `typescript`, `go`, `rust`, `kotlin`, `swift`, `sql`). Ambiguous (C vs C++, JS vs TS): pick by syntax; truly unclear: ask.
- **Approach**: a short Chinese name for the idea, like 「两栈法」「双指针」「DFS 沉岛」「哈希表」. Same idea in another language → reuse the existing approach name.
- **Slug**: the approach in short lowercase English kebab-case (`two-stacks`, `two-pointers`, `dfs-sink`, `hash-map`). Same idea as an existing solution → reuse its stem; the script adds the right extension.

Decide these yourself; don't ask HD to confirm them.

## 4. Format the code

Formatting may not change behaviour. Keep HD's names, comments and logic.

- Use a formatter when installed: `pnpm exec prettier --no-config --stdin-filepath x.ts` (JS/TS; `--no-config` so the site's no-semicolon style doesn't strip HD's semicolons), `rustfmt`, `ruff format` or `black` (Python), `gofmt`, `clang-format` (C/C++), `google-java-format`.
- Otherwise tidy by hand: the language's usual indentation (4 spaces; 2 for JS/TS), no trailing spaces, no tabs, one trailing newline, no stray blank lines.
- Leave LeetCode's class/function signature as given.

## 5. Save

Write the formatted code to a temp file, then:

```bash
pnpm -s lc:add <id> --code "$TMP/solution.<ext>" --language <id> --approach "<approach>" --slug <slug> \
  [--notes "<note>"] [--date YYYY-MM-DD] [--meta "$TMP/meta.json"]
```

Pass `--meta` only when step 1 fetched (new problem), so LeetCode isn't asked twice. Repeat for each solution HD pasted. If it says the code is already saved, tell HD and skip it.

## 6. Check and commit

```bash
pnpm lint && pnpm check && pnpm test && pnpm build
```

All must pass (the build re-validates `data/`). Then commit only that problem's folder:

```bash
git add data/problems/<id>
git commit -m "feat(data): add #<id> <file>[, <file>…]"
```

Subject ≤ 72 characters; if several files make it longer, use `feat(data): add #<id> solutions`. No body. Never `git push` — HD pushes, and the push deploys the site.

## 7. Report

One short Chinese summary: problem, file(s) saved, approach, the commit hash, and a reminder that `git push` will publish it.

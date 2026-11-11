# hd-leetcode

Static Svelte site showing every LeetCode problem HD has solved; read-only, all data in `data/`. Must not break: build-time data validation and the one-screen layout.

## Stack

- Runtime: Node 24
- Framework: Svelte 5 (runes) + Vite, TypeScript
- Package manager: **pnpm** (not npm, not yarn)
- Data: `data/problems/<id>/meta.json` + one source file per solution; no backend
- Highlighting: highlight.js core with only the languages in `src/lib/highlight.ts`

## Commands

| Purpose             | Command                                      |
| ------------------- | -------------------------------------------- |
| Install             | `pnpm install`                               |
| Dev server          | `pnpm dev`                                   |
| Dev with other data | `DATA_DIR=path/to/data pnpm dev`             |
| All tests           | `pnpm test`                                  |
| One test file       | `pnpm test src/lib/filter.test.ts` (no `--`) |
| Types               | `pnpm check`                                 |
| Format check / fix  | `pnpm lint` / `pnpm format`                  |
| Build               | `pnpm build`                                 |
| Serve the build     | `pnpm preview` (at `/hd-leetcode/`)          |
| Fetch problem meta  | `pnpm lc:fetch 232` (needs `.env`)           |

## Rules

- Run `pnpm lint`, `pnpm check` and `pnpm test` before every commit. Do not commit if any fails.
- The page itself never scrolls (`.app` is `100dvh`, `html, body` overflow hidden). Only panels scroll inside: list, code, notes, dropdown menus. Phones (< 768px) show the list or one problem, never both.
- No text selection and no image dragging site-wide (`src/app.css`, `src/main.ts`). Inputs stay selectable.
- Fonts are self-hosted in `public/fonts/` and preloaded in `index.html`. Never add Google Fonts or CDN fonts.
- Every `<img>` is `loading="lazy"` or preloaded; `scripts/images.test.ts` enforces it.
- Colors come from the CSS variables in `src/app.css`; add a variable rather than a new hard-coded color.
- Icons are inline SVG; icon-only buttons need `aria-label` and `title`. Brand icons come from Simple Icons (CC0) with the version in a comment.
- Build data URLs from `import.meta.env.BASE_URL` (see `src/lib/data.ts`); the site will live under a sub-path on GitHub Pages.
- Changing the data schema: update `src/lib/types.ts`, the validator in `scripts/build-index.ts` and its tests together. Ask first.
- Ask before adding a dependency.
- `.env` holds HD's LeetCode cookies: never print, log or commit their values. Keep LeetCode requests few and spaced; never bulk-fetch.

## Gotchas

- Base path: the dev server serves `/`; `build` and `vite preview` use `/hd-leetcode/` (`vite.config.ts`). Preview also runs with command `serve`, so the check needs `isPreview`.
- Deploy: push to `main` → `.github/workflows/deploy.yml` (lint, check, test, build) → GitHub Pages at https://hongdalin.blog/hd-leetcode/.
- `data/` is not in `public/`: `scripts/vite-plugin-data.ts` serves it in dev and emits `data/index.json` plus each `meta.json` and listed solution file on build. Stray files in `data/` never ship.
- The selection lives in the URL hash (`#/<id>/<file>`), written with `replaceState` so browsing doesn't flood history.
- Flex children with long no-wrap text need `min-width: 0`, or they push the layout wider (the sidebar did).
- The header only shows totals plus "今天已刷 N 份 ✓" on days with solves. No streaks, no "not yet today" — this is a log, not a check-in.

## Read these only when relevant

Decide which of these the task needs and read only those.

- PRD (Notion, fetch with the Notion tool): https://app.notion.com/p/LeetCode-3e260d3cf9f381408aeee759262ed7d2 — scope, schema, roadmap
- UI design (claude.ai Design canvas, read with the Artifact tool): https://claude.ai/artifact/8vbrs3przNoSPtC8qBMAEH

## When unsure

If a change touches more than three files, or any schema or public interface, propose the approach before writing code.

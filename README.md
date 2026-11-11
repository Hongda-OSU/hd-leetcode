<img src="assets/icon.png" width="128" height="128" alt="hd-leetcode icon: a smiling pixel-art terminal window with a green check badge">

# hd-leetcode

A personal site that keeps every LeetCode problem I've solved, with my solutions in any language, searchable and easy to review.

**Demo:** https://hongdalin.blog/hd-leetcode/

## Features

- Search by number or title; filter by difficulty, company and topic
- Several solutions per problem (different languages or approaches), syntax-highlighted, one-click copy
- Random pick to review an old problem
- One-screen, IDE-style layout that also works on phones
- Static site: problems live in the repo, one folder each

## Tech Stack

- Frontend: Svelte 5, TypeScript, Vite
- Syntax highlighting: highlight.js
- Tests: Vitest
- Hosting: GitHub Pages, deployed by GitHub Actions on every push to `main`

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 12+

### Installation

```bash
git clone https://github.com/Hongda-OSU/hd-leetcode.git
cd hd-leetcode
pnpm install
cp .env.example .env   # only needed for the LeetCode scripts
```

## Usage

```bash
pnpm dev     # start the dev server, then open the URL it prints
pnpm test    # unit tests
pnpm check   # type-check
pnpm lint    # formatting check (pnpm format to fix)
pnpm build   # production build into dist/
pnpm preview # serve the build at /hd-leetcode/, as on GitHub Pages
```

To preview the site with another data folder (for example, sample data for UI work), set `DATA_DIR`:

```bash
DATA_DIR=path/to/data pnpm dev
```

To fetch a problem's metadata (title, difficulty, topics, company tags) from LeetCode:

```bash
pnpm lc:fetch 232
```

Each problem is a folder under `data/problems/<id>/`: a `meta.json` plus one source file per solution. The build validates every `meta.json` and fails on bad data; the schema is in `src/lib/types.ts`.

## Environment Variables

| Variable             | Description                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| `LEETCODE_SESSION`   | LeetCode login cookie (Premium, for company tags); expires about every two weeks |
| `LEETCODE_CSRFTOKEN` | Optional LeetCode `csrftoken` cookie                                             |

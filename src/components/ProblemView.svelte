<script lang="ts">
  import { loadMeta, loadSource } from '../lib/data'
  import { languageLabel } from '../lib/languages'
  import type { IndexProblem } from '../lib/types'
  import CodeView from './CodeView.svelte'

  let {
    problem,
    file,
    onfile,
    onback,
  }: {
    problem: IndexProblem
    /** Selected solution file; falls back to the first one. */
    file: string | undefined
    onfile: (file: string) => void
    /** Back to the list; the button only shows on phones. */
    onback: () => void
  } = $props()

  const DIFF_COLOR = { Easy: 'var(--easy)', Medium: 'var(--medium)', Hard: 'var(--hard)' }

  const sol = $derived(problem.solutions.find((s) => s.file === file) ?? problem.solutions[0])
  // Trailing newline would add an empty last line.
  const source = $derived(loadSource(problem.id, sol.file).then((t) => t.replace(/\r?\n$/, '')))
  const notes = $derived(
    loadMeta(problem.id).then((m) => m.solutions.find((s) => s.file === sol.file)?.notes ?? ''),
  )

  let copyState = $state<'idle' | 'done' | 'failed'>('idle')
  let copyTimer: ReturnType<typeof setTimeout>

  async function copy() {
    clearTimeout(copyTimer)
    try {
      await navigator.clipboard.writeText(await source)
      copyState = 'done'
    } catch {
      copyState = 'failed'
    }
    copyTimer = setTimeout(() => (copyState = 'idle'), 2000)
  }

  $effect(() => {
    void sol.file // reset the copy label when switching solutions
    copyState = 'idle'
  })
</script>

<div class="top">
  <button type="button" class="back" onclick={onback}>← 列表</button>
  <div class="heading">
    <div>
      <div class="num">#{problem.id}</div>
      <h1>{problem.title}</h1>
    </div>
    <a class="lc" href={problem.url} target="_blank" rel="noreferrer">LeetCode ↗</a>
  </div>
  <div class="meta">
    <span style:color={DIFF_COLOR[problem.difficulty]}>{problem.difficulty}</span>
    {#if problem.topics.length}
      <span class="sep" aria-hidden="true">·</span>
      {#each problem.topics as t (t)}
        <span class="tag">{t}</span>
      {/each}
    {/if}
    {#if problem.companies.length}
      <span class="sep" aria-hidden="true">·</span>
      <span class="companies">{problem.companies.join(' · ')}</span>
    {/if}
  </div>
</div>

<div class="tabs" role="tablist" aria-label="解法文件">
  {#each problem.solutions as s (s.file)}
    <button
      type="button"
      role="tab"
      aria-selected={s.file === sol.file}
      class:on={s.file === sol.file}
      onclick={() => onfile(s.file)}
    >
      {s.file}
    </button>
  {/each}
</div>

<div class="body" role="tabpanel">
  {#await source}
    <p class="status">加载中…</p>
  {:then code}
    <CodeView {code} language={sol.language} />
  {:catch err}
    <p class="status">代码加载失败：{err.message}</p>
  {/await}
</div>

{#await notes then note}
  {#if note}
    <div class="note"><span class="note-label">// 笔记</span>{note}</div>
  {/if}
{/await}

<div class="statusbar">
  <span>
    {sol.approach} · {languageLabel(sol.language)}
    {#await source then code}· {code.split('\n').length} 行{/await}
    · {sol.dateSolved}
  </span>
  <button type="button" onclick={copy}>
    {copyState === 'done' ? '已复制 ✓' : copyState === 'failed' ? '复制失败' : '复制代码'}
  </button>
</div>

<style>
  .top {
    flex: none;
    padding: 18px 28px 14px;
    border-bottom: 1px solid var(--border);
  }

  .back {
    display: none;
    min-height: 32px;
    margin: -6px 0 6px -4px;
    padding: 0 4px;
    background: none;
    border: none;
    color: var(--accent);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  @media (max-width: 767px) {
    .back {
      display: block;
    }

    .top {
      padding: 14px 16px 12px;
    }

    h1 {
      font-size: 18px;
    }
  }

  .heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .num {
    font-size: 12px;
    color: var(--faint);
  }

  h1 {
    margin: 6px 0 0;
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  .lc {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 6px;
    font-size: 12px;
    text-decoration: none;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 12px;
  }

  .sep {
    color: #4a535c;
  }

  .tag {
    padding: 2px 8px;
    border-radius: 4px;
    color: #c4ccd4;
    background: #1a2028;
  }

  .companies {
    color: var(--muted);
  }

  .tabs {
    flex: none;
    display: flex;
    overflow-x: auto;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
  }

  .tabs button {
    min-height: 40px;
    padding: 0 18px;
    background: transparent;
    color: var(--muted);
    border: none;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    border-top: 2px solid transparent;
    font: inherit;
    font-size: 12px;
    white-space: nowrap;
    cursor: pointer;
  }

  .tabs button.on {
    background: var(--bg);
    color: var(--text);
    border-top-color: var(--accent);
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background: var(--bg);
  }

  .status {
    margin: 0;
    padding: 16px 28px;
    color: var(--muted);
  }

  .note {
    flex: none;
    max-height: 30%;
    overflow-y: auto;
    padding: 12px 28px;
    border-top: 1px solid var(--border);
    font-size: 12px;
    line-height: 1.7;
    color: #c4ccd4;
  }

  .note-label {
    margin-right: 10px;
    color: var(--accent);
  }

  .statusbar {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    min-height: 36px;
    padding: 0 16px;
    background: var(--accent);
    color: #08140f;
    font-size: 11px;
  }

  .statusbar button {
    min-height: 28px;
    padding: 0 10px;
    background: rgba(8, 20, 15, 0.12);
    color: #08140f;
    border: none;
    border-radius: 4px;
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }
</style>

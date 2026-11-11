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

  // LeetCode logo from Simple Icons 16.37.0 (CC0-1.0).
  const LEETCODE_ICON =
    'M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z'

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

  const copyLabel = $derived(
    copyState === 'done' ? '已复制' : copyState === 'failed' ? '复制失败' : '复制代码',
  )

  $effect(() => {
    void sol.file // reset the copy icon when switching solutions
    copyState = 'idle'
  })
</script>

<div class="top">
  <button type="button" class="back" onclick={onback}>← 列表</button>
  <div class="num">#{problem.id}</div>
  <h1>{problem.title}</h1>
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

<div class="code-area">
  <!-- Floats over the code; stays put while the code scrolls. -->
  <div class="tools">
    <button
      type="button"
      class="tool"
      class:done={copyState === 'done'}
      class:failed={copyState === 'failed'}
      aria-label={copyLabel}
      title={copyLabel}
      onclick={copy}
    >
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" class="stroke">
        {#if copyState === 'done'}
          <path d="M5 12.5 10 17.5 19 7"></path>
        {:else if copyState === 'failed'}
          <path d="M6 6l12 12M18 6 6 18"></path>
        {:else}
          <rect x="9" y="9" width="12" height="12" rx="2"></rect>
          <path d="M5 15V5a2 2 0 0 1 2-2h10"></path>
        {/if}
      </svg>
    </button>
    <a
      class="tool lc"
      href={problem.url}
      target="_blank"
      rel="noreferrer"
      aria-label="在 LeetCode 打开"
      title="在 LeetCode 打开"
    >
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d={LEETCODE_ICON}></path>
      </svg>
    </a>
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

  .code-area {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .tools {
    position: absolute;
    z-index: 2;
    top: 10px;
    right: 14px;
    display: flex;
    gap: 2px;
    padding: 3px;
    background: var(--panel);
    border: 1px solid var(--border-strong);
    border-radius: 7px;
  }

  .tool {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    color: var(--muted);
    border: none;
    border-radius: 5px;
    outline: none;
    cursor: pointer;
  }

  .tool:hover {
    background: rgba(255, 255, 255, 0.07);
    color: var(--text);
  }

  .tool.lc:hover {
    color: #ffa116; /* LeetCode brand orange */
  }

  .tool.done {
    color: var(--accent);
  }

  .tool.failed {
    color: var(--hard);
  }

  .stroke {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
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
</style>

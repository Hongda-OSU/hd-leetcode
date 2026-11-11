<script lang="ts">
  import {
    facetOptions,
    filterProblems,
    hasActiveFilters,
    EMPTY_FILTERS,
    type Facet,
    type Filters,
  } from '../lib/filter'
  import { languageList } from '../lib/languages'
  import { pickRandom } from '../lib/random'
  import type { IndexProblem } from '../lib/types'

  let {
    problems,
    selectedId,
    onselect,
  }: {
    problems: IndexProblem[]
    selectedId: number | undefined
    onselect: (id: number) => void
  } = $props()

  let filters = $state<Filters>({ ...EMPTY_FILTERS })

  const filtered = $derived(filterProblems(problems, filters))
  const facets: { key: Facet; label: string }[] = [
    { key: 'difficulty', label: '难度' },
    { key: 'company', label: '公司' },
    { key: 'topic', label: '分类' },
  ]

  const DIFF_COLOR: Record<string, string> = {
    Easy: 'var(--easy)',
    Medium: 'var(--medium)',
    Hard: 'var(--hard)',
  }

  const latestDate = (p: IndexProblem) =>
    p.solutions.reduce((max, s) => (s.dateSolved > max ? s.dateSolved : max), '')

  function randomPick() {
    const current = problems.find((p) => p.id === selectedId)
    const pick = pickRandom(filtered, problems, current)
    if (pick) onselect(pick.id)
  }

  let list: HTMLDivElement

  // Random picks and shared links can select a row that's out of view.
  $effect(() => {
    void selectedId
    list.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
  })
</script>

<aside>
  <div class="controls">
    <label class="search">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="M20 20l-3.5-3.5"></path>
      </svg>
      <span class="sr-only">搜索题目</span>
      <input type="search" bind:value={filters.q} placeholder="题号或标题" />
    </label>

    <div class="facets">
      {#each facets as f (f.key)}
        <label class="facet">
          {f.label}
          <select bind:value={filters[f.key]} class:active={filters[f.key] !== ''}>
            <option value="">全部</option>
            {#each facetOptions(problems, filters, f.key) as o (o.value)}
              <option value={o.value}>{o.value} ({o.count})</option>
            {/each}
          </select>
        </label>
      {/each}
    </div>
  </div>

  <div class="list" bind:this={list}>
    <div class="list-head">
      <span class="count">
        {filtered.length} 道题
        {#if hasActiveFilters(filters)}
          <button
            type="button"
            class="clear"
            onclick={() => (filters = { ...EMPTY_FILTERS, q: filters.q })}
          >
            清空筛选
          </button>
        {/if}
      </span>
      <button type="button" class="random" onclick={randomPick} disabled={problems.length === 0}>
        随机一题 ↻
      </button>
    </div>

    {#each filtered as p (p.id)}
      <button
        type="button"
        class="row"
        class:selected={p.id === selectedId}
        aria-current={p.id === selectedId}
        onclick={() => onselect(p.id)}
      >
        <span class="line">
          <span class="dot" style:background={DIFF_COLOR[p.difficulty]} aria-hidden="true"></span>
          <span class="id">{p.id}</span>
          <span class="title">{p.title}</span>
        </span>
        <span class="sub">
          <span>{latestDate(p).slice(5)}</span>
          <span>{languageList(p.solutions)}</span>
        </span>
      </button>
    {:else}
      <p class="empty">{problems.length ? '没有符合条件的题。' : '还没有题目。'}</p>
    {/each}
  </div>
</aside>

<style>
  aside {
    flex: 0 0 340px;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    background: var(--panel);
  }

  @media (max-width: 767px) {
    aside {
      flex: 1 1 0;
      min-width: 0;
      border-right: none;
    }
  }

  .controls {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 10px;
    background: var(--bg);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
  }

  .search svg {
    flex: none;
    fill: none;
    stroke: var(--muted);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .search input {
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font: inherit;
    font-size: 12px;
  }

  .search input::placeholder {
    color: var(--faint);
  }

  .search:focus-within {
    border-color: var(--accent);
  }

  .facets {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .facet {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    font-size: 10px;
    color: var(--faint);
  }

  .facet select {
    width: 100%;
    min-height: 36px;
    padding: 0 6px;
    background: var(--bg);
    color: var(--muted);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    font: inherit;
    font-size: 12px;
  }

  .facet select.active {
    color: var(--text);
    border-color: var(--accent);
  }

  .list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0;
  }

  .list-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 32px;
    padding: 0 8px 4px 16px;
  }

  .count {
    font-size: 11px;
    color: var(--faint);
  }

  button {
    font: inherit;
    cursor: pointer;
  }

  .clear {
    min-height: 28px;
    margin-left: 8px;
    background: none;
    border: none;
    color: var(--muted);
    text-decoration: underline;
    font-size: 11px;
  }

  .random {
    min-height: 32px;
    padding: 0 8px;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 12px;
  }

  .random:disabled {
    color: var(--faint);
    cursor: default;
  }

  .row {
    width: 100%;
    min-height: 56px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 16px;
    text-align: left;
    background: transparent;
    border: none;
    color: var(--text);
  }

  .row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .row.selected {
    background: #1a2a26;
  }

  .line {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .dot {
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .id {
    flex: none;
    font-size: 11px;
    color: var(--faint);
  }

  .title {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub {
    display: flex;
    gap: 8px;
    padding-left: 14px;
    font-size: 11px;
    color: var(--muted);
  }

  .empty {
    margin: 0;
    padding: 24px 16px;
    color: var(--muted);
    font-size: 12px;
  }
</style>

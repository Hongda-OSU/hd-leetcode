<script lang="ts">
  import Header from './components/Header.svelte'
  import Heatmap from './components/Heatmap.svelte'
  import ProblemView from './components/ProblemView.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import { loadIndex } from './lib/data'
  import { localToday } from './lib/dates'
  import { buildHeatmap } from './lib/heatmap'
  import { computeStats, countByDay } from './lib/stats'

  const today = localToday()
  const indexPromise = loadIndex()

  let selectedId = $state<number>()
  let selectedFile = $state<string>()
</script>

<div class="app">
  {#await indexPromise}
    <p class="status">加载中…</p>
  {:then index}
    {@const stats = computeStats(index.problems, today)}
    {@const current = index.problems.find((p) => p.id === selectedId) ?? index.problems[0]}
    <Header {stats} />
    <Heatmap
      cells={buildHeatmap(countByDay(index.problems), today)}
      today={stats.today}
      activeDays={stats.activeDays}
    />
    <div class="workspace">
      <Sidebar
        problems={index.problems}
        selectedId={current?.id}
        onselect={(id) => {
          selectedId = id
          selectedFile = undefined
        }}
      />
      <main>
        {#if current}
          <ProblemView problem={current} file={selectedFile} onfile={(f) => (selectedFile = f)} />
        {:else}
          <p class="status">还没有题目，用 /lc 添加第一道。</p>
        {/if}
      </main>
    </div>
  {:catch err}
    <p class="status">数据加载失败：{err.message}</p>
  {/await}
</div>

<style>
  .app {
    height: 100vh;
    height: 100dvh; /* excludes the mobile browser toolbar */
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .workspace {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .status {
    margin: 0;
    padding: 24px;
    color: var(--muted);
  }
</style>

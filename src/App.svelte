<script lang="ts">
  import Header from './components/Header.svelte'
  import Heatmap from './components/Heatmap.svelte'
  import ProblemView from './components/ProblemView.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import { loadIndex } from './lib/data'
  import { localToday } from './lib/dates'
  import { buildHeatmap } from './lib/heatmap'
  import { formatHash, parseHash, type Route } from './lib/route'
  import { computeStats, countByDay } from './lib/stats'

  const today = localToday()
  const indexPromise = loadIndex()

  // The URL hash holds the selection, so refresh and shared links restore it.
  let route = $state<Route>(parseHash(location.hash))

  function go(next: Route) {
    route = next
    // replaceState: browsing problems shouldn't flood the back button.
    history.replaceState(null, '', formatHash(next) || location.pathname)
  }
</script>

<svelte:window onhashchange={() => (route = parseHash(location.hash))} />

<div class="app">
  {#await indexPromise}
    <p class="status">加载中…</p>
  {:then index}
    {@const stats = computeStats(index.problems, today)}
    {@const current = index.problems.find((p) => p.id === route.id) ?? index.problems[0]}
    <Header {stats} />
    <Heatmap
      cells={buildHeatmap(countByDay(index.problems), today)}
      today={stats.today}
      activeDays={stats.activeDays}
    />
    <div class="workspace">
      <Sidebar problems={index.problems} selectedId={current?.id} onselect={(id) => go({ id })} />
      <main>
        {#if current}
          <ProblemView
            problem={current}
            file={route.file}
            onfile={(file) => go({ id: current.id, file })}
          />
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

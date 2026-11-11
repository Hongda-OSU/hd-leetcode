<script lang="ts">
  import type { HeatCell } from '../lib/heatmap'

  let { cells, today, activeDays }: { cells: HeatCell[]; today: number; activeDays: number } =
    $props()

  let scroller: HTMLDivElement

  // On narrow screens, start scrolled to the latest weeks.
  $effect(() => {
    scroller.scrollLeft = scroller.scrollWidth
  })
</script>

<section>
  <div class="scroller" bind:this={scroller}>
    <div class="grid" role="img" aria-label="过去一年的刷题热力图，{activeDays} 个活跃日">
      {#each cells as c (c.date)}
        <span class="cell l{c.level}" title="{c.date} · {c.count} 份解法"></span>
      {/each}
    </div>
  </div>
  <div class="today">
    <span class="label">今天</span>
    {#if today > 0}
      <span class="done">✓ 已刷 {today} 份</span>
    {:else}
      <span class="label">还没刷</span>
    {/if}
  </div>
</section>

<style>
  section {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    padding: 12px 24px;
    border-bottom: 1px solid var(--border);
  }

  .scroller {
    flex: 1 1 600px;
    min-width: 0;
    overflow-x: auto;
  }

  .grid {
    display: grid;
    grid-template-rows: repeat(7, 9px);
    grid-auto-flow: column;
    grid-auto-columns: 9px;
    gap: 2px;
    width: max-content;
  }

  .cell {
    border-radius: 2px;
  }

  .l0 {
    background: #1a2028;
  }
  .l1 {
    background: #1d3a31;
  }
  .l2 {
    background: #25604c;
  }
  .l3 {
    background: #35936f;
  }
  .l4 {
    background: var(--accent);
  }

  .today {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }

  .label {
    color: var(--muted);
  }

  .done {
    color: var(--accent);
  }
</style>

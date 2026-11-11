<script lang="ts">
  import type { Stats } from '../lib/stats'

  let { stats }: { stats: Stats } = $props()
</script>

<header>
  <div class="left">
    <a class="home" href="./">~/hd-leetcode</a>
    <span class="stats">
      {stats.problems} 道题 · {stats.solutions} 份解法
      <!-- Only celebrate a day with solves; no nagging on days without. -->
      {#if stats.today > 0}
        · <span class="accent">今天已刷 {stats.today} 份 ✓</span>
      {/if}
    </span>
  </div>
  <a class="github" href="https://github.com/Hongda-OSU">GitHub ↗</a>
</header>

<style>
  header {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
  }

  .left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 18px;
  }

  @media (max-width: 767px) {
    header {
      padding: 10px 16px;
      gap: 4px 12px;
    }

    .left {
      gap: 4px 12px;
    }
  }

  .home {
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
  }

  .stats,
  .github {
    font-size: 12px;
    color: var(--muted);
  }

  .github {
    text-decoration: none;
  }

  .accent {
    color: var(--accent);
    white-space: nowrap;
  }
</style>

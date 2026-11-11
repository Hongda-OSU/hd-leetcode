<script lang="ts">
  import type { Stats } from '../lib/stats'

  let { stats }: { stats: Stats } = $props()
</script>

<header>
  <div class="left">
    <a class="home" href="./">~/hd-leetcode</a>
    <span class="stats">
      连续 <span class="accent">{stats.streak}</span> 天 · 共 {stats.solutions} 份解法 · {stats.activeDays}
      个活跃日
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
  }
</style>

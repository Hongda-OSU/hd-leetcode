<script lang="ts">
  import type { Stats } from '../lib/stats'

  let { stats }: { stats: Stats } = $props()

  // GitHub mark from Simple Icons 16.37.0 (CC0-1.0).
  const GITHUB_ICON =
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
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
  <a
    class="github"
    href="https://github.com/Hongda-OSU"
    target="_blank"
    rel="noreferrer"
    aria-label="GitHub"
    title="GitHub"
  >
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d={GITHUB_ICON}></path>
    </svg>
  </a>
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

  .stats {
    font-size: 12px;
    color: var(--muted);
  }

  .github {
    width: 30px;
    height: 30px;
    margin: -6px -6px -6px 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: var(--muted);
  }

  .github:hover {
    background: rgba(255, 255, 255, 0.07);
    color: var(--text);
  }

  .accent {
    color: var(--accent);
    white-space: nowrap;
  }
</style>

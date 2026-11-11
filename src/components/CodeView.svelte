<script lang="ts">
  import { highlight } from '../lib/highlight'
  import '../styles/code-theme.css'

  let { code, language }: { code: string; language: string } = $props()

  const html = $derived(highlight(code, language))
  const lineCount = $derived(code.split('\n').length)
</script>

<div class="code">
  <div class="gutter" aria-hidden="true">
    {#each { length: lineCount }, i (i)}
      <span>{i + 1}</span>
    {/each}
  </div>
  <!-- highlight() escapes the source, so this HTML is safe -->
  <pre class="hljs"><code>{@html html}</code></pre>
</div>

<style>
  .code {
    display: flex;
    width: max-content;
    min-width: 100%;
    padding: 16px 0;
    font-size: 13px;
    line-height: 22px;
  }

  .gutter {
    position: sticky;
    left: 0;
    flex: none;
    display: flex;
    flex-direction: column;
    width: 52px;
    padding-right: 18px;
    box-sizing: border-box;
    text-align: right;
    color: #56606a;
    background: var(--bg);
  }

  pre {
    margin: 0;
    padding-right: 96px; /* long lines can scroll out from under the tool overlay */
    font: inherit;
  }
</style>

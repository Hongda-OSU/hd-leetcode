<script lang="ts">
  import type { FacetOption } from '../lib/filter'

  let {
    label,
    value = $bindable(),
    options,
    align = 'start',
  }: {
    /** Shown when nothing is picked; also the accessible name. */
    label: string
    /** `''` = no filter. */
    value: string
    options: FacetOption[]
    /** `end` opens the menu flush right, for the last box in a row. */
    align?: 'start' | 'end'
  } = $props()

  const uid = $props.id()
  let open = $state(false)
  let active = $state(0)
  let root: HTMLDivElement
  let listbox = $state<HTMLUListElement>()

  // Row 0 clears the filter.
  const rows = $derived([{ value: '', count: -1 }, ...options])

  function toggle() {
    open = !open
    if (open)
      active = Math.max(
        0,
        rows.findIndex((r) => r.value === value),
      )
  }

  function pick(v: string) {
    value = v
    open = false
  }

  $effect(() => {
    if (open && listbox) {
      listbox.focus()
      listbox.querySelector(`#${uid}-${active}`)?.scrollIntoView({ block: 'nearest' })
    }
  })

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') active = Math.min(rows.length - 1, active + 1)
    else if (e.key === 'ArrowUp') active = Math.max(0, active - 1)
    else if (e.key === 'Enter' || e.key === ' ') pick(rows[active].value)
    else if (e.key === 'Escape' || e.key === 'Tab') open = false
    else return
    e.preventDefault()
  }

  function onwindowclick(e: MouseEvent) {
    if (open && !root.contains(e.target as Node)) open = false
  }
</script>

<svelte:window onclick={onwindowclick} />

<div class="dropdown" bind:this={root}>
  <button
    type="button"
    class="trigger"
    class:active={value !== ''}
    class:open
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label="{label}：{value || '全部'}"
    onclick={toggle}
  >
    <span class="text" class:placeholder={value === ''}>{value || label}</span>
    <svg class="chevron" aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
      <path d="M3 4.5 6 7.5 9 4.5"></path>
    </svg>
  </button>

  {#if open}
    <ul
      class="menu"
      class:end={align === 'end'}
      role="listbox"
      tabindex="-1"
      aria-label={label}
      aria-activedescendant="{uid}-{active}"
      bind:this={listbox}
      {onkeydown}
    >
      {#each rows as r, i (r.value)}
        <!-- Keyboard is handled on the listbox via aria-activedescendant. -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          id="{uid}-{i}"
          role="option"
          aria-selected={r.value === value}
          class:active={i === active}
          class:empty={r.count === 0}
          onclick={() => pick(r.value)}
          onmouseenter={() => (active = i)}
        >
          <span class="name">{r.value || `全部${label}`}</span>
          {#if r.count >= 0}<span class="count">{r.count}</span>{/if}
          <svg class="check" aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
            <path d="M2.5 6.5 5 9l4.5-6"></path>
          </svg>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
    min-width: 0;
  }

  .trigger {
    width: 100%;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 12px;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    outline: none;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  .trigger:hover,
  .trigger.open {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .trigger.active {
    border-color: var(--accent);
  }

  .text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .placeholder {
    color: var(--muted);
  }

  .chevron {
    flex: none;
    fill: none;
    stroke: var(--muted);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.15s;
  }

  .open .chevron {
    transform: rotate(180deg);
  }

  .menu {
    position: absolute;
    z-index: 10;
    top: calc(100% + 4px);
    left: 0;
    min-width: 100%;
    width: max-content;
    max-width: 240px;
    max-height: 280px;
    overflow-y: auto;
    margin: 0;
    padding: 4px;
    list-style: none;
    background: #161b21;
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    outline: none;
    box-sizing: border-box;
  }

  .menu.end {
    left: auto;
    right: 0;
  }

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 32px;
    padding: 0 8px 0 10px;
    border-radius: 4px;
    font-size: 12px;
    color: #c4ccd4;
    cursor: pointer;
  }

  li.active {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
  }

  li.empty {
    color: #56606a;
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count {
    flex: none;
    font-size: 11px;
    color: var(--faint);
  }

  .check {
    flex: none;
    fill: none;
    stroke: var(--accent);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    visibility: hidden;
  }

  li[aria-selected='true'] {
    color: var(--accent);
  }

  li[aria-selected='true'] .check {
    visibility: visible;
  }
</style>

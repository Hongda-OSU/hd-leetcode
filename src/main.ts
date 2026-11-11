import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Firefox ignores -webkit-user-drag, so block image drags here too.
document.addEventListener('dragstart', (e) => {
  if (e.target instanceof HTMLImageElement || e.target instanceof SVGElement) e.preventDefault()
})

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app

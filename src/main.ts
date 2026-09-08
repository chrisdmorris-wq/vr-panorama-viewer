import './style.css'
import { PanoramaViewer } from './viewer'

const container = document.getElementById('canvas-container')!
const viewer = new PanoramaViewer(container as HTMLElement, {
  // default path; replace with your own panorama at /assets/panorama.jpg
  src: '/assets/panorama.jpg',
})

const toggleBtn = document.getElementById('toggle-vr')!
const resetBtn = document.getElementById('reset-view')!

let vrMode = false

toggleBtn.addEventListener('click', async () => {
  if (!vrMode) {
    const ok = await viewer.enterVR()
    if (ok) {
      vrMode = true
      toggleBtn.textContent = 'Exit VR'
    }
  } else {
    viewer.exitVR()
    vrMode = false
    toggleBtn.textContent = 'Enter VR'
  }
})

resetBtn.addEventListener('click', () => viewer.resetView())

// Resize handling
window.addEventListener('resize', () => viewer.resize())

// Start render loop
viewer.start()

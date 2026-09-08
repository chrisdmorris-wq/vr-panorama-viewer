import * as THREE from 'three'

type Options = { src?: string }

export class PanoramaViewer {
  container: HTMLElement
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  mesh: THREE.Mesh | null = null
  isRunning = false
  isVR = false
  lon = 0
  lat = 0
  phi = 0
  theta = 0
  distance = 0.1
  pointerDown = false
  pointerX = 0
  pointerY = 0
  textureLoaded = false

  constructor(container: HTMLElement, opts: Options = {}) {
    this.container = container
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.01, 1000)
    this.camera.position.set(0, 0, 0.1)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.xr.enabled = true

    container.appendChild(this.renderer.domElement)

    // simple ambient
    this.scene.add(new THREE.AmbientLight(0xffffff, 1))

    const src = opts.src || '/assets/panorama.jpg'
    this.loadPanorama(src)

    this.addEventListeners()
  }

  async loadPanorama(src: string) {
    const loader = new THREE.TextureLoader()
    loader.load(
      src,
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping
        tex.encoding = THREE.sRGBEncoding
        const geom = new THREE.SphereGeometry(500, 60, 40)
        // invert the sphere to view from inside
        geom.scale(-1, 1, 1)
        const mat = new THREE.MeshBasicMaterial({ map: tex })
        this.mesh = new THREE.Mesh(geom, mat)
        this.scene.add(this.mesh)
        this.textureLoaded = true
      },
      undefined,
      () => {
        console.warn('Failed to load panorama:', src)
        // fallback: add a gradient or color
        const geom = new THREE.SphereGeometry(500, 32, 16)
        geom.scale(-1, 1, 1)
        const mat = new THREE.MeshBasicMaterial({ color: 0x202030 })
        this.mesh = new THREE.Mesh(geom, mat)
        this.scene.add(this.mesh)
      }
    )
  }

  addEventListeners() {
    const canvas = this.renderer.domElement

    canvas.addEventListener('pointerdown', (e) => {
      this.pointerDown = true
      this.pointerX = e.clientX
      this.pointerY = e.clientY
    })
    canvas.addEventListener('pointermove', (e) => {
      if (!this.pointerDown) return
      const deltaX = e.clientX - this.pointerX
      const deltaY = e.clientY - this.pointerY
      this.pointerX = e.clientX
      this.pointerY = e.clientY
      this.lon -= deltaX * 0.1
      this.lat += deltaY * 0.1
      this.lat = Math.max(-85, Math.min(85, this.lat))
    })
    canvas.addEventListener('pointerup', () => (this.pointerDown = false))
    canvas.addEventListener('pointerleave', () => (this.pointerDown = false))

    // wheel to zoom (change fov)
    canvas.addEventListener('wheel', (e) => {
      this.camera.fov = Math.max(30, Math.min(100, this.camera.fov + e.deltaY * 0.01))
      this.camera.updateProjectionMatrix()
    })
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    const loop = () => {
      if (!this.isRunning) return
      this.update()
      this.renderer.render(this.scene, this.camera)
      this.renderer.setAnimationLoop(loop)
    }
    this.renderer.setAnimationLoop(loop)
  }

  stop() {
    this.isRunning = false
    this.renderer.setAnimationLoop(null)
  }

  update() {
    // convert lon/lat to camera target
    this.phi = THREE.MathUtils.degToRad(90 - this.lat)
    this.theta = THREE.MathUtils.degToRad(this.lon)

    const x = this.distance * Math.sin(this.phi) * Math.cos(this.theta)
    const y = this.distance * Math.cos(this.phi)
    const z = this.distance * Math.sin(this.phi) * Math.sin(this.theta)

    this.camera.lookAt(x, y, z)
  }

  resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  async enterVR() {
    if (!('xr' in navigator)) {
      alert('WebXR not available in this browser. Non-VR fallback will continue.')
      return false
    }
    try {
      // Request an immersive session
      // This requires secure context (HTTPS) or localhost
      // and a WebXR-capable browser/device.
      // Three.js will handle session rendering once setSession is called.
      const supported = await (navigator as any).xr.isSessionSupported('immersive-vr')
      if (!supported) {
        alert('Immersive VR not supported on this device.')
        return false
      }
      const session = await (navigator as any).xr.requestSession('immersive-vr')
      ;(this.renderer as any).xr.setSession(session)
      this.isVR = true
      return true
    } catch (err) {
      console.error('Failed to enter VR', err)
      return false
    }
  }

  exitVR() {
    const session = (this.renderer as any).xr.getSession && (this.renderer as any).xr.getSession()
    if (session) session.end()
    this.isVR = false
  }

  resetView() {
    this.lon = 0
    this.lat = 0
    this.camera.fov = 75
    this.camera.updateProjectionMatrix()
  }
}

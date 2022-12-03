import { LoadingManager, MeshBasicMaterial, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer } from 'three'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Tween from '@tweenjs/tween.js'
import boardDescription from './assets/boards/board_1.json'
import { Board } from './models/board'

const scene = new Scene()
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new WebGLRenderer({
  antialias: true,
})
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
const controls = new OrbitControls(camera, renderer.domElement)
const loadingManager = new LoadingManager()
const textureLoader = new TextureLoader(loadingManager)

const [boardTexture] = await Promise.all([
  textureLoader.loadAsync('/background.svg')
])

const target = new Board(boardDescription, new MeshBasicMaterial({ map: boardTexture }))
scene.add(target)

// renderer
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
// resize window listener
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
})
// controls
camera.position.y = 2.8
controls.enablePan = false
controls.enableZoom = false
controls.maxPolarAngle = 60 * (Math.PI / 180)
// composer
composer.addPass(renderPass)

const animate: XRFrameRequestCallback = (time: number) => {
  composer.render()
  controls.update()
  Tween.update(time)
}

// dom
document.body.prepend(renderer.domElement)
// start rendering
renderer.setAnimationLoop(animate)
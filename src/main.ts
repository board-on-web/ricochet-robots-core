import { Color, LoadingManager, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Tween from '@tweenjs/tween.js'
import boardDescription from './assets/boards/board_1.json'
import boardTokensDescription from './assets/boards/board_1_tokens.json'
import { Board } from './models/board'
import { loadTextures } from './utils/load-textures'
import { loadStlModels } from './utils/load-models'
import { Robot } from './models/robot'
import { GameController } from './controller/game'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { Arrow } from './models/arrow'

const scene = new Scene()
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new WebGLRenderer({
  antialias: true,
})
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
const controls = new OrbitControls(camera, renderer.domElement)
const loadingManager = new LoadingManager()

const textures = await loadTextures(loadingManager)
const models = await loadStlModels(loadingManager)
const arrow = await new SVGLoader(loadingManager)
  .loadAsync('/arrow.svg')
  // arrow.svg contains only 1 <path>
  .then(it => it.paths[0].toShapes(true))
  .then(it => new Arrow(it))

const gameController = new GameController(
  boardDescription,
  boardTokensDescription,
  arrow,
  models,
  textures
)

scene.add(
  ...gameController.models
)

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
// controls.enablePan = false
// controls.enableZoom = false
// controls.maxPolarAngle = 60 * (Math.PI / 180)
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
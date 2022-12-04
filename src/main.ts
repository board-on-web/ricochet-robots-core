import { Color, LoadingManager, PerspectiveCamera, Vec2, WebGLRenderer } from 'three'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import Tween from '@tweenjs/tween.js'
import boardDescription from './assets/boards/board_1.json'
import boardTokensDescription from './assets/boards/board_1_tokens.json'
import robotsDescription from './assets/robots.json'
import { loadTextures } from './utils/load-textures'
import { loadStlModels } from './utils/load-models'
import { Robot } from './models/robot'
import { GameController } from './controller/game'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { Arrow } from './models/arrow'
import { CameraController } from './controller/camera'
import { SceneController } from './controller/scene'
import { RaycasterController } from './controller/raycaster'

const scene = new SceneController()
const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new WebGLRenderer({
  antialias: true,
})
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
const controls = new CameraController(camera, renderer.domElement)
const loadingManager = new LoadingManager()
const raycaster = new RaycasterController()

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
  robotsDescription,
  arrow,
  models,
  textures
)
// win listener
gameController.setWhenWinListener(() => {
  alert('Win!')
})
// click listener
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  const intersects = raycaster.intersects(
    scene, camera, { x: event.clientX, y: event.clientY }, renderer.domElement,
  )
  
  if (!intersects.length) {
    return
  }

  controls.enabled = false

  // handle click by objects
  let target

  if ((target = intersects.find(it => it.object instanceof Arrow && it.object.visible))) {
    return gameController.clickByArrow(target.object as Arrow)
  }

  if ((target = intersects.find(it => it.object instanceof Robot && it.object.visible))) {
    // change background color
    scene.changeBackground(new Color(target.object.userData.tint))
    controls.toInitialPosition()

    return gameController.clickByRobot(target.object as Robot)
  }

  scene.changeBackground()
  controls.enabled = true
  return gameController.clickMiss()
})

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
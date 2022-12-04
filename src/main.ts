import { Color, LoadingManager, PerspectiveCamera, Vec2, WebGLRenderer } from 'three'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import Tween from '@tweenjs/tween.js'
import bd from './assets/boards/board_1.json'
import btd from './assets/boards/board_1_tokens.json'
import rd from './assets/robots.json'
import { loadTextures } from './utils/load-textures'
import { loadStlModels } from './utils/load-models'
import { Robot } from './models/robot'
import { GameController } from './controller/game'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { Arrow } from './models/arrow'
import { CameraController } from './controller/camera'
import { SceneController } from './controller/scene'
import { RaycasterController } from './controller/raycaster'
import { ArrowsController } from './controller/arrows'
import { BoardController } from './controller/board'
import { RobotsController } from './controller/robots'
import { RoundController } from './controller/round'

class ViewController {
  private scene = new SceneController()
  private camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  private renderer = new WebGLRenderer({
    antialias: true,
  })
  private composer = new EffectComposer(this.renderer)
  private renderPass = new RenderPass(this.scene, this.camera)
  private controls = new CameraController(this.camera, this.renderer.domElement)
  private raycaster = new RaycasterController()
  private loadingManager = new LoadingManager()
  
  private arrows!: ArrowsController
  private board!: BoardController
  private robots!: RobotsController
  private rc!: RoundController
  private gc!: GameController

  private clickListener = (event: MouseEvent) => {
    const point: Vec2 = { x: event.clientX, y: event.clientY }
    const intersects = this.raycaster.intersects(this.scene, this.camera, point, this.renderer.domElement)
    
    if (!intersects.length) {
      return
    }

    // handle click by objects
    let target

    if ((target = intersects.find(it => it.object instanceof Arrow && it.object.visible))) {
      this.beforeClickByArrow()
      return this.gc.clickByArrow(target.object as Arrow)
    }

    if ((target = intersects.find(it => it.object instanceof Robot && it.object.visible))) {
      this.beforeClickByRobot(target.object as Robot)
      return this.gc.clickByRobot(target.object as Robot)
    }

    this.beforeMissClick()
    return this.gc.clickMiss()
  }

  private keyupListener = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft': {
        if (this.gc.hasSelectedRobot) {
          this.gc.moveSelectedRobot(0)
        }

        break
      }
        

      case 'ArrowUp': {
        if (this.gc.hasSelectedRobot) {
          this.gc.moveSelectedRobot(1)
        }
        
        break
      }

      case 'ArrowRight': {
        if (this.gc.hasSelectedRobot) {
          this.gc.moveSelectedRobot(2)
        }
        
        break
      }

      case 'ArrowDown': {
        if (this.gc.hasSelectedRobot) {
          this.gc.moveSelectedRobot(3)
        }
        
        break
      }

      case 'Space': {
        this.beforeClickByRobot(this.robots.nextRobot)
        this.gc.setNextSelectedRobot()

        break
      }
    }
  }

  public async make() {
    const [textures, models, arrow] = await Promise.all([
      loadTextures(this.loadingManager),
      loadStlModels(this.loadingManager),
      new SVGLoader(this.loadingManager)
        .loadAsync('/arrow.svg')
        // arrow.svg contains only 1 <path>
        .then(it => it.paths[0].toShapes(true))
        .then(it => new Arrow(it))
    ])

    this.arrows = new ArrowsController(arrow)
    this.board = new BoardController(bd, btd, textures)
    this.robots = new RobotsController().make(rd, models)
    this.rc = new RoundController(this.board.tokens.slice())
    this.gc = new GameController(this.board, this.robots, this.arrows, this.rc)

    this.prepare()
    this.makeListeners()
  }

  public start() {
    const animate: XRFrameRequestCallback = (time: number) => {
      this.composer.render()
      this.controls.update()
      Tween.update(time)
    }
    
    // dom
    document.body.prepend(this.renderer.domElement)
    // start rendering
    this.renderer.setAnimationLoop(animate)
  }

  private prepare() {
    this.scene.add(
      ...this.gc.models
    )
    // renderer
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // resize window listener
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    })
    // composer
    this.composer.addPass(this.renderPass)
  }

  private makeListeners() {
    // end of round listener (after target robot place on target token)
    this.rc.whenEndRound(() => {
      alert('Win!')
    })
    // end of game listener (tokens ends)
    this.rc.whenEndGame(() => {
      alert('End of game!')
    })
    // change turn listener
    this.rc.whenChangeTurn((turn) => {
      alert('Turn: ' + turn)
    })

    // keypress listener
    window.addEventListener('keyup', this.keyupListener)
    // click listener
    this.renderer.domElement.addEventListener('click', this.clickListener)
  }

  private beforeMissClick() {
    this.controls.enabled = true
    this.scene.changeBackground()
  }

  private beforeClickByArrow() {
    this.controls.enabled = false
  }
  
  private beforeClickByRobot(robot: Robot) {
    this.controls.enabled = false
    this.controls.toInitialPosition()
    this.scene.changeBackground(new Color(robot.userData.tint))
  }
}

try {
  const vc = new ViewController()
  await vc.make()
  
  vc.start()
} catch (err) { 
  throw new Error('Not implemented')
}

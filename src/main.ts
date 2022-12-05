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
import { TokensController } from './controller/round'
import { MessagesController } from './controller/messages'
import { NotationsRenderer } from './controller/notation-renderer'

class ViewController {
  private scene = new SceneController()
  private camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  private renderer = new WebGLRenderer({
    antialias: true,
  })
  private notationsRenderer = new NotationsRenderer()
  private composer = new EffectComposer(this.renderer)
  private renderPass = new RenderPass(this.scene, this.camera)
  private controls = new CameraController(this.camera, this.renderer.domElement)
  private raycaster = new RaycasterController()
  private loadingManager = new LoadingManager()
  
  private arrows!: ArrowsController
  private board!: BoardController
  private robots!: RobotsController
  private tc!: TokensController
  private gc!: GameController
  private mc!: MessagesController

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

  private readonly messagesListener: ConstructorParameters<typeof MessagesController>[0] = (event) => {
    switch (event.data.event) {
      case 'change_turn': {
        break
      }

      case 'end_game': {
        // TODO (2022.12.05): Enable any rotation
        break
      }

      // TODO (2022.12.05): Top windown event, present next token for players
      case 'next_token': {
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
    this.mc = new MessagesController(this.messagesListener)
    this.tc = new TokensController(btd, this.mc).prepare()
    this.gc = new GameController(
      this.board, this.robots, this.arrows, this.tc, this.mc
    )

    this.prepare()
    this.makeListeners()

    return this
  }

  public start() {
    const animate: XRFrameRequestCallback = (time: number) => {
      this.composer.render()
      this.notationsRenderer.render(this.scene, this.camera)
      this.controls.update()
      Tween.update(time)
    }
    
    // dom
    document.body.append(this.renderer.domElement)
    document.body.append(this.notationsRenderer.domElement)
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
    this.notationsRenderer.setSize(window.innerWidth, window.innerHeight)
    // resize window listener
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.notationsRenderer.setSize(window.innerWidth, window.innerHeight)
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.position.y = 5
      this.camera.updateProjectionMatrix()
    })
    // composer
    this.composer.addPass(this.renderPass)
    // start game
    // TODO (2022.12.05): This event must emit top window
    this.mc.emit({
      event: 'prepare'
    })
    // TODO (2022.12.05): This event must emit top window
    this.mc.emit({
      event: 'change_turn',
      turn: 'set-token'
    })
  }

  private makeListeners() {
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
  const vc = await new ViewController().make()
  vc.start()
} catch (err) {
  console.error(err);
  
  throw new Error('Not implemented')
}

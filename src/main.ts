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
import { Arrow } from './models/arrow'
import { CameraController } from './controller/camera'
import { SceneController } from './controller/scene'
import { RaycasterController } from './controller/raycaster'
import { ArrowsController } from './controller/arrows'
import { BoardController } from './controller/board'
import { RobotsController } from './controller/robots'
import { TokensController } from './controller/round'
import { MessagesListener, MessagesController } from './controller/messages'
import { NotationsRenderer } from './controller/notation-renderer'
import { loadSvgs } from './utils/load-svgs'

class ViewController {
  private readonly scene = new SceneController()
  private readonly camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  private readonly renderer = new WebGLRenderer({
    antialias: true,
  })
  private readonly notationsRenderer = new NotationsRenderer()
  private readonly composer = new EffectComposer(this.renderer)
  private readonly renderPass = new RenderPass(this.scene, this.camera)
  private readonly controls = new CameraController(this.camera, this.renderer.domElement)
  private readonly raycaster = new RaycasterController()
  private readonly loadingManager = new LoadingManager()
  
  private arrows!: ArrowsController
  private board!: BoardController
  private robots!: RobotsController
  private gc!: GameController
  private tc!: TokensController
  private mc!: MessagesController

  private readonly clickListener = (event: MouseEvent) => {
    const point: Vec2 = { x: event.clientX, y: event.clientY }
    const intersects = this.raycaster.intersects(this.scene, this.camera, point, this.renderer.domElement)
    
    if (!intersects.length) {
      return
    }

    // handle click by objects
    let target

    if ((target = intersects.find(it => it.object instanceof Arrow && it.object.visible))) {
      return this.handleClickByArrow(target.object as Arrow)
    }

    if ((target = intersects.find(it => it.object instanceof Robot && it.object.visible))) {
      return this.handleClickByRobot(target.object as Robot)
    }

    return this.handleMissClick()
  }

  private readonly keyupListener = (event: KeyboardEvent) => {
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
        this.handleClickByRobot(this.robots.nextRobot)

        break
      }
    }
  }

  private readonly messagesListener: MessagesListener = (event) => {
    switch (event.data.event) {
      case 'prepare': {
        this.gc.prepare()
        break
      }

      case 'restore_state': {
        this.gc.restoreState(event.data.state)
        break
      }

      case 'show_robots': {
        this.gc.showRobots()
        break
      }

      case 'hide_robots': {
        this.gc.hideRobots()
        break
      }

      case 'next_token': {
        break
      }

      case 'change_phase': {
        switch (event.data.phase) {
          case 'prepare': {
            this.gc.setPhasePrepare()
            break
          }

          case 'planning': {
            break
          }

          case 'presentation': {
            this.startListeners()
            break
          }

          case 'end_round': {
            this.cancelListeners()
            this.gc.setPhaseEndRound()
            break
          }
        }

        break
      }
    }
  }

  public async make() {
    const [textures, models, paths] = await Promise.all([
      loadTextures(this.loadingManager),
      loadStlModels(this.loadingManager),
      loadSvgs(this.loadingManager),
    ])
    
    // arrow.svg contains only 1 <path>
    this.arrows = new ArrowsController(new Arrow(paths['arrow'][0]))
    this.board = new BoardController(bd, btd, textures)
    this.robots = new RobotsController().make(rd, models)
    this.mc = new MessagesController()
    this.tc = new TokensController(btd)
    this.gc = new GameController(
      this.board, this.robots, this.arrows, this.tc, this.mc
    )

    this.mc.addMessagesListener(this.messagesListener)
    this.prepareScene()

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

  private prepareScene() {
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
      this.camera.updateProjectionMatrix()
    })
    // composer
    this.composer.addPass(this.renderPass)
  }

  private handleMissClick() {
    this.controls.enabled = true
    this.scene.changeBackground()

    return this.gc.clickMiss()
  }

  private handleClickByArrow(arrow: Arrow) {
    this.controls.enabled = false

    return this.gc.clickByArrow(arrow)
  }
  
  private handleClickByRobot(robot: Robot) {
    this.controls.enabled = false
    this.controls.toInitialPosition()
    this.scene.changeBackground(new Color(robot.userData.tint))

    return this.gc.clickByRobot(robot)
  }

  private startListeners() {
    // this.cancelListeners()

    // start keypress listener
    window.addEventListener('keyup', this.keyupListener)
    // start click listener
    this.renderer.domElement.addEventListener('click', this.clickListener)
  }

  private cancelListeners() {
    // remove keypress listener
    window.removeEventListener('keyup', this.keyupListener)
    // remove click listener
    this.renderer.domElement.removeEventListener('click', this.clickListener)
    this.handleMissClick()
  }
}

async function main() {
  try {
    const vc = await new ViewController().make()
    vc.start()
  } catch (err) {
    console.error(err);
    
    throw new Error('Not implemented')
  }
}

main()
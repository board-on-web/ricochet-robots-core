import { Object3D, Vec2 } from "three";
import { Arrow } from "../models/arrow";
import robotsDescription from '../assets/robots.json'
import { BoardParts, BoardTokens } from "../models/board";
import { Robot } from "../models/robot";
import { loadStlModels } from "../utils/load-models";
import { loadTextures } from "../utils/load-textures";
import { Direction } from "../types/direction";
import { RobotsController } from "./robots";
import { Map } from "../models/map";
import { BoardController } from "./board";
import { ArrowsController } from "./arrows";
import { RoundController } from "./round";

export class GameController {
  private map = new Map()

  private arrowsController: ArrowsController
  private boardController: BoardController
  private robotsController: RobotsController
  private _roundController: RoundController

  constructor(
    boardParts: BoardParts,
    boardTokens: BoardTokens,
    robots: typeof robotsDescription,
    arrow: Arrow,
    models: Awaited<ReturnType<typeof loadStlModels>>,
    textures: Awaited<ReturnType<typeof loadTextures>>
  ) {
    this.arrowsController = new ArrowsController(arrow)
    this.boardController = new BoardController(boardParts, boardTokens, textures)
    this.robotsController = new RobotsController().make(robots, models)
    this._roundController = new RoundController(
      this.boardController.tokens.slice()
    )
    // hide after initial
    this.arrowsController.hide()

    this.robotsController.forEach(robot => {
      robot.moveTo({
        x: Math.round((Math.random() * 15)),
        y: Math.round((Math.random() * 15))
      })
    })
  }

  public selectRobot(robot: Robot) {
    this.robotsController.setSelectedRobot(robot)

    this.arrowsController.moveToRobot(robot)
    this.arrowsController.visibleByDirection(
      this.robotDirection(robot)
    )
  }

  public unselectRobot() {
    this.robotsController.clearSelectedRobot()
    this.arrowsController.hide()
  }

  public clickByRobot(robot: Robot) {
    this.selectRobot(robot)
  }

  public clickByArrow(arrow: Arrow) {   
    return this.moveSelectedRobot(arrow.userData.direction) 
  }

  public clickMiss() {
    this.unselectRobot()
  }

  public moveSelectedRobot(direction: Direction) {
    if (!this.selectedRobot) {
      return
    }

    // cancel move if direction arrow hidden
    if (!this.arrowsController.isArrowVisible(direction)) {
      return
    }

    const target = this.routeTo(this.selectedRobot, direction)
    this.selectedRobot
      .moveTo(target)
      .onStart(() => this.arrowsController.hide())
      .onComplete(() => {
        if (this.selectedRobot) {
          this.arrowsController.moveToRobot(this.selectedRobot)
          this.arrowsController.visibleByDirection(
            this.robotDirection(this.selectedRobot)
          )

          if (this.validateWin(this.selectedRobot, this.boardController.tokens[0])) {
            this.roundController.emitEndRound()
          }
        }
      })
  }

  public get hasSelectedRobot(): boolean {
    return Boolean(this.selectedRobot)
  }

  public setNextSelectedRobot() {
    this.selectRobot(this.robotsController.nextRobot)
  }

  public get models(): Array<Object3D> {
    return [
      this.boardController,
      this.arrowsController,
      ...this.robotsController,
    ]
  }

  public get roundController(): RoundController {
    return this._roundController
  }

  private validateWin(robot: Robot, target: typeof this.boardController.tokens[number]): boolean {
    return this.boardController.tokens.some(it =>
      target.userData.type === it.userData.type
        && it.coords.x === robot.coords.x && it.coords.y === robot.coords.y 
        && it.userData.color.includes(robot.userData.type)
    )
  }

  private robotDirection(robot: Robot): number {
    const description = this.map.generate(
      this.boardController, this.unselectedRobots
    )
    return description[robot.coords.y][robot.coords.x]
  }

  private routeTo(robot: Robot, direction: Direction): Vec2 {
    const description = this.map.generate(
      this.boardController,
      this.robotsController.filter(it => it !== robot)
    )

    return this.map.calcRouteToByDirection(
      robot.coords, direction, description
    )
  }

  private get selectedRobot() {
    return this.robotsController.selectedRobot
  }

  private get unselectedRobots() {
    return this.robotsController.filter(it => it !== this.selectedRobot)
  }
}
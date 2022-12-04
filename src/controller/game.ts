import { MathUtils, Object3D, Vec2 } from "three";
import { Arrow } from "../models/arrow";
import { BoardTokens, BOARD_SIZE } from "../models/board";
import { Robot } from "../models/robot";
import { Direction } from "../types/direction";
import { RobotsController } from "./robots";
import { Map } from "../models/map";
import { BoardController } from "./board";
import { ArrowsController } from "./arrows";
import { RoundController } from "./round";

export class GameController {
  private map = new Map()

  constructor(
    private readonly boardController: BoardController,
    private readonly robotsController: RobotsController,
    private readonly arrowsController: ArrowsController,
    private readonly roundController: RoundController,
  ) {
    // hide after initial
    this.arrowsController.hide()

    const generatedPositions = this.generatePositions()
    this.robotsController.forEach((robot, idx) => {
      robot.moveTo(generatedPositions[idx])
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

          if (this.validateWin(this.selectedRobot, this.roundController.targetToken)) {
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

  private generatePositions(): Array<Vec2> {
    const map = this.map.generate(this.boardController, [])
    const mapCoords: Array<Vec2> = Array(BOARD_SIZE).fill(undefined).flatMap((_, y) => {
      return Array(BOARD_SIZE)
        .fill(undefined)
        .map((_, x) => map[x][y] !== 15 && !this.boardController.tokens.some(it => it.coords.x === x && it.coords.y === y) && { x, y })
        .filter(Boolean) as Array<Vec2>
    })

    return Array(5).fill(undefined).map(() => 
      mapCoords.splice(MathUtils.randInt(0, mapCoords.length - 1), 1)[0]
    )
  }

  private validateWin(robot: Robot, target: BoardTokens[number][number]): boolean {
    return this.boardController.tokens.some(it =>
      target.token === it.userData.type
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

    return this.map.calcRouteToByDirection(robot.coords, direction, description)
  }

  private get selectedRobot() {
    return this.robotsController.selectedRobot
  }

  private get unselectedRobots() {
    return this.robotsController.filter(it => it !== this.selectedRobot)
  }
}
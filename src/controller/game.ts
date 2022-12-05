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
import { MessagesController } from "./messages";

export class GameController {
  private map = new Map()

  constructor(
    private readonly board: BoardController,
    private readonly robots: RobotsController,
    private readonly arrows: ArrowsController,
    private readonly rc: RoundController,
    private readonly mc: MessagesController,
  ) {
    // hide after initial
    this.arrows.hide()

    const generatedPositions = this.generatePositions()
    this.robots.forEach((robot, idx) => {
      robot.moveTo(generatedPositions[idx])
    })
  }

  public selectRobot(robot: Robot) {
    this.robots.setSelectedRobot(robot)

    this.arrows.moveToRobot(robot)
    this.arrows.visibleByDirection(
      this.robotDirection(robot)
    )
  }

  public unselectRobot() {
    this.robots.clearSelectedRobot()
    this.arrows.hide()
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
    if (!this.arrows.isArrowVisible(direction)) {
      return
    }

    const target = this.routeTo(this.selectedRobot, direction)
    this.selectedRobot
      .moveTo(target)
      .onStart(() => this.arrows.hide())
      .onComplete(() => {
        if (this.selectedRobot) {
          this.arrows.moveToRobot(this.selectedRobot)
          this.arrows.visibleByDirection(
            this.robotDirection(this.selectedRobot)
          )

          if (this.validateWin(this.selectedRobot, this.rc.targetToken)) {
            this.mc.emit({ event: 'end_turn' })
          }
        }
      })
  }

  public get hasSelectedRobot(): boolean {
    return Boolean(this.selectedRobot)
  }

  public setNextSelectedRobot() {
    this.selectRobot(this.robots.nextRobot)
  }

  public get models(): Array<Object3D> {
    return [
      this.board,
      this.arrows,
      ...this.robots,
    ]
  }

  private generatePositions(): Array<Vec2> {
    const map = this.map.generate(this.board, [])
    const mapCoords: Array<Vec2> = Array(BOARD_SIZE).fill(undefined).flatMap((_, y) => {
      return Array(BOARD_SIZE)
        .fill(undefined)
        .map((_, x) => map[x][y] !== 15 && !this.board.tokens.some(it => it.coords.x === x && it.coords.y === y) && { x, y })
        .filter(Boolean) as Array<Vec2>
    })

    return Array(5).fill(undefined).map(() => 
      mapCoords.splice(MathUtils.randInt(0, mapCoords.length - 1), 1)[0]
    )
  }

  private validateWin(robot: Robot, target: BoardTokens[number][number]): boolean {
    return this.board.tokens.some(it =>
      target.token === it.userData.type
        && it.coords.x === robot.coords.x && it.coords.y === robot.coords.y 
        && it.userData.color.includes(robot.userData.type)
    )
  }

  private robotDirection(robot: Robot): number {
    const description = this.map.generate(
      this.board, this.unselectedRobots
    )
    return description[robot.coords.y][robot.coords.x]
  }

  private routeTo(robot: Robot, direction: Direction): Vec2 {
    const description = this.map.generate(
      this.board,
      this.robots.filter(it => it !== robot)
    )

    return this.map.calcRouteToByDirection(robot.coords, direction, description)
  }

  private get selectedRobot() {
    return this.robots.selectedRobot
  }

  private get unselectedRobots() {
    return this.robots.filter(it => it !== this.selectedRobot)
  }
}
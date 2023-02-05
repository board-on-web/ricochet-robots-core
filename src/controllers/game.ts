import { MathUtils, Object3D, Vec2 } from "three";
import { Arrow } from "../models/arrow";
import { BoardToken, BOARD_SIZE } from "../models/board";
import { Robot, ROBOTS_COUNT } from "../models/robot";
import { Direction } from "../types/direction";
import { RobotsController } from "./robots";
import { Map } from "../models/map";
import { BoardController } from "./board";
import { ArrowsController } from "./arrows";
import { TokensController } from "./tokens";
import { MessagesController } from "./messages";
import { State } from "../models/state";
import { Phase } from "../types/phase";

export class GameController {
  private readonly map = new Map()

  private _lastState: State | null = null

  private _phase: Phase | null = null

  constructor(
    private readonly board: BoardController,
    private readonly robots: RobotsController,
    private readonly arrows: ArrowsController,
    private readonly tc: TokensController,
    private readonly mc: MessagesController,
  ) {
    // hide after initial
    this.arrows.hide()
  }

  public setRobotsPositions(positions: Vec2[]) {
    this.robots.forEach((robot, idx) => robot.moveTo(positions[idx]))
    this.robots.show()
  }

  public generateRobotsPositions() {
    const positions = this.generatePositions()
    this.mc.postMessage({
      event: 'generate_positions',
      positions,
    })
  }

  public sendTokens() {
    this.mc.postMessage({
      event: 'get_tokens',
      tokens: this.tc.tokens,
    })
  }

  public commitState(state: State) {
    throw new Error('Not implemented')
  }

  public restoreState(state: State) {
    // restore robots positions
    this.robots.restore(state.robots)
    // restore tokens
    this.tc.restore(state)
  }

  public commitLocallyState(state: State) {
    this._lastState = state
  }

  /** prepare board for restored game */
  public restoreLocallyState() {
    if (!this._lastState) {
      return
    }

    // restore robots positions
    this.robots.restore(this._lastState.robots)
    // restore tokens
    this.tc.restore(this._lastState)
  }

  public showRobots() {
    this.robots.show()
  }

  public hideRobots() {
    this.robots.hide()
  }

  public setPhaseEndRound() {
    this._phase = 'end_round'

    this.board.removeTargetToken()

    // commit current state
    this.mc.postMessage({
      event: 'commit_state',
      state: {
        ...this.tc.state,
        robots: this.robots.state,
      }
    })
  }

  public setTargetToken(token: BoardToken) {
    // TODO (2023.02.05): Validate when robot is on target
    this.tc.target = token
    this.board.targetToken = token
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
          this.arrows.attachToRobot(this.selectedRobot)
          this.arrows.visibleByDirection(
            this.robotDirection(this.selectedRobot)
          )

          if (this.tc.target && this.validateWin(this.selectedRobot, this.tc.target)) {
            this.mc.postMessage({
              event: 'change_phase',
              phase: 'target_reached'
            })
          }
        }
      })
  }

  public get hasSelectedRobot(): boolean {
    return Boolean(this.selectedRobot)
  }

  public get models(): Array<Object3D> {
    return [
      this.board,
      this.arrows,
      ...this.robots,
    ]
  }

  public get phase(): typeof this._phase {
    return this._phase
  }

  private selectRobot(robot: Robot) {
    this.robots.setSelectedRobot(robot)

    this.arrows.attachToRobot(robot)
    this.arrows.visibleByDirection(
      this.robotDirection(robot)
    )
  }

  private unselectRobot() {
    this.robots.clearSelectedRobot()
    this.arrows.hide()
  }

  private generatePositions(): Array<Vec2> {
    const map = this.map.generate(this.board, [])
    const mapCoords: Array<Vec2> = Array(BOARD_SIZE).fill(undefined).flatMap((_, y) => {
      return Array(BOARD_SIZE)
        .fill(undefined)
        .map((_, x) => map[x][y] !== 15 && !this.board.tokens.some(it => it.coords.x === x && it.coords.y === y) && { x, y })
        .filter(Boolean) as Array<Vec2>
    })

    return Array(ROBOTS_COUNT).fill(undefined).map(() => 
      mapCoords.splice(MathUtils.randInt(0, mapCoords.length - 1), 1)[0]
    )
  }

  private validateWin(robot: Robot, target: BoardToken): boolean {
    return this.board.tokens.some(it =>
      target.token === it.userData.type
        && it.coords.x === robot.coords.x && it.coords.y === robot.coords.y 
        && it.userData.color.includes(robot.userData.robot)
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
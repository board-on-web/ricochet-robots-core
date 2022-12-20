import { MathUtils, Object3D, Vec2 } from "three";
import { Arrow } from "../models/arrow";
import { BoardToken, BOARD_SIZE } from "../models/board";
import { Robot } from "../models/robot";
import { Direction } from "../types/direction";
import { RobotsController } from "./robots";
import { Map } from "../models/map";
import { BoardController } from "./board";
import { ArrowsController } from "./arrows";
import { TokensController } from "./round";
import { MessagesListener, MessagesController } from "./messages";

export class GameController {
  private map = new Map()

  private readonly messagesListener: MessagesListener = (event) => {
    switch (event.data.event) {
      /** Prepare board for new game */
      case 'prepare': {
        // prepare and place robots
        const generatedPositions = this.generatePositions()
        this.robots.forEach((robot, idx) => robot.moveTo(generatedPositions[idx]))
        this.robots.show()

        break
      }

      /** Prepare board for restored game */
      case 'restore_state': {
        // restore robots positions
        this.robots.restore(event.data.state.robots)
        // restore tokens
        this.tc.restore(event.data.state)

        break
      }

      case 'show-robots': {
        this.robots.show()
        break
      }
      
      case 'hide-robots': {
        this.robots.hide()
        break
      }

      case 'change_turn': {
        switch (event.data.turn) {
          case 'set-token': {
            // TODO (2022.12.05): Disable move robots
            const nextToken = this.tc.getNextToken()
            this.board.setTargetToken(nextToken)

            this.mc.emit({
              event: 'next_token',
              token: nextToken
            })

            break
          }

          case 'planning': {
            // TODO (2022.12.05): Disable move robots
            // TODO (2022.12.05): Wait until best answer ready
            break
          }

          case 'presentation': {
            // TODO (2022.12.05): Enable move robots for best player
            break
          }

          case 'end-round': {
            // TODO (2022.12.05): Disable move robots
            this.board.removeTargetToken()

            // emit current state
            this.mc.emit({
              event: 'commit_state',
              state: {
                ...this.tc.state,
                robots: this.robots.state,
              }
            })

            // TODO (2022.12.05): This event must emit top window
            this.mc.emit({
              event: 'change_turn',
              turn: 'set-token'
            })
          }
        }

        break
      }

      case 'end_game': {
        // TODO (2022.12.05): Disable move robots

        break
      }
    }
  }

  constructor(
    private readonly board: BoardController,
    private readonly robots: RobotsController,
    private readonly arrows: ArrowsController,
    private readonly tc: TokensController,
    private readonly mc: MessagesController,
  ) {
    // hide after initial
    this.arrows.hide()
    // subsribe to game events
    mc.subscribeToMessages(this.messagesListener)
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

          if (this.tc.target && this.validateWin(this.selectedRobot, this.tc.target)) {
            this.mc.emit({
              event: 'change_turn',
              turn: 'end-round'
            })
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

  private validateWin(robot: Robot, target: BoardToken): boolean {
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
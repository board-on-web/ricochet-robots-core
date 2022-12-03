import { Color, Object3D, Vec2 } from "three";
import { Arrow, Arrows } from "../models/arrow";
import robotsDescription from '../assets/robots.json'
import { Board, BoardDescription, BoardParts, BoardTokens } from "../models/board";
import { Robot } from "../models/robot";
import { loadStlModels } from "../utils/load-models";
import { loadTextures } from "../utils/load-textures";

export class GameController {
  private boardDescription = new BoardDescription()
  private board: Board
  private arrows: Arrows
  private robots: Array<Robot>

  private selectedRobot: Robot | null = null

  constructor(
    boardParts: BoardParts,
    boardTokens: BoardTokens,
    robots: typeof robotsDescription,
    arrow: Arrow,
    models: Awaited<ReturnType<typeof loadStlModels>>,
    textures: Awaited<ReturnType<typeof loadTextures>>
  ) {
    this.arrows = new Arrows(arrow)
    this.board = this.makeBoard(boardParts, boardTokens, textures)
    this.robots = this.makeRobots(robots, models)
    // hide after initial
    this.arrows.hide()

    this.robots.forEach(robot => {
      robot.moveTo({
        x: Math.round((Math.random() * 15)),
        y: Math.round((Math.random() * 15))
      })
    })
  }

  private makeBoard(parts: BoardParts, tokens: BoardTokens, textures: Awaited<ReturnType<typeof loadTextures>>): Board {
    const board = new Board(parts, tokens, textures)
    return board
  }

  private makeRobots(robots: typeof robotsDescription, models: Awaited<ReturnType<typeof loadStlModels>>): Array<Robot> {
    return robots.map(it => {
      const robot = new Robot(models, new Color(it.color))
      robot.userData = {
        type: 'robot',
        name: it.name,
        tint: it.tint
      }

      return robot
    })
  }

  public selectRobot(robot: Robot) {
    this.selectedRobot = robot
    this.selectedRobot.markSelect()
    this.arrows.moveToRobot(this.selectedRobot)
    this.arrows.visibleByDirection(
      this.robotDirection(robot)
    )
  }

  public unselectRobot() {
    this.robots.forEach(it => it.markUnselect());
    this.selectedRobot = null
    this.arrows.hide()
  }

  public clickByRobot(robot: Robot) {
    this.robots.forEach(it => it.markUnselect());
    this.selectRobot(robot)
  }

  public clickByArrow(arrow: Arrow) {    
    if (!this.selectedRobot) {
      return
    }

    const routePosition = this.routeTo(this.selectedRobot, arrow)
    this.selectedRobot.moveTo(routePosition)
    this.selectRobot(this.selectedRobot)
  }

  public clickMiss() {
    this.unselectRobot()
  }

  public get models(): Array<Object3D> {
    return [
      this.board,
      this.arrows,
      ...this.robots,
    ]
  }

  private robotDirection(robot: Robot): number {
    const position = this.boardDescription.positionByCoords({
      x: robot.position.x,
      y: robot.position.z
    })
    const description = this.boardDescription.generate(
      this.board,
      this.robots.filter(it => it !== robot)
    )
    return description[position.y][position.x]
  }

  private routeTo(robot: Robot, arrow: Arrow): Vec2 {
    const robotPosition = this.boardDescription.positionByCoords({
      x: robot.position.x,
      y: robot.position.z,
    })
    const direction = arrow.userData.direction
    const description = this.boardDescription.generate(
      this.board,
      this.robots.filter(it => it !== robot)
    )

    return this.boardDescription.calcRouteToByDirection(
      robotPosition, direction, description
    )
  }
}
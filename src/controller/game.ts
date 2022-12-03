import { Color, Material, Object3D } from "three";
import { Arrow, Arrows } from "../models/arrow";
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
    arrow: Arrow,
    models: Awaited<ReturnType<typeof loadStlModels>>,
    textures: Awaited<ReturnType<typeof loadTextures>>
  ) {
    this.arrows = new Arrows(arrow)
    this.board = this.makeBoard(boardParts, boardTokens, textures)
    this.robots = this.makeRobots(models)
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

  private makeRobots(models: Awaited<ReturnType<typeof loadStlModels>>): Array<Robot> {
    const colors = [ new Color('yellow'), new Color('red'), new Color('green'), new Color('blue'), new Color('grey') ]
    return colors.map((color, index) => {
      const robot = new Robot(models, color)
      robot.userData = {
        type: 'robot',
        // 0 - yellow
        // 1 - red
        // 2 - green
        // 3 - blue
        // 4 - grey
        index,
      }

      return robot
    })
  }

  public selectRobot(robot: Robot) {
    this.selectedRobot = robot
    this.selectedRobot.markSelect()
    this.arrows.moveTo({
      x: this.selectedRobot.position.x,
      y: this.selectedRobot.position.z,
    })
    this.arrows.visibleByDirection(
      this.robotDirection(robot)
    )
  }

  public unselectRobot() {
    this.selectedRobot = null
    this.arrows.hide()
  }

  public clickByRobot(robot: Robot) {
    this.robots.forEach(it => it.markUnselect());
    this.selectRobot(robot)
  }

  public clickByArrow(arrow: Arrow) {
    console.log(arrow);
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
}
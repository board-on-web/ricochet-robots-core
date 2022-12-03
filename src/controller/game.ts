import { Color, Object3D } from "three";
import { Arrow, Arrows } from "../models/arrow";
import { Board, BoardMap, BoardParts, BoardTokens } from "../models/board";
import { Robot } from "../models/robot";
import { loadStlModels } from "../utils/load-models";
import { loadTextures } from "../utils/load-textures";

export class GameController {
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

    console.log(new BoardMap().generate(this.board, this.robots));
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
    if (!this.robots.includes(robot)) {
      throw new Error('Robot not found')
    }

    this.selectedRobot = robot
    this.arrows.moveTo({
      x: this.selectedRobot.position.x,
      y: this.selectedRobot.position.z,
    })
    // TODO (2022.12.03): Reset arrows visible
  }

  public get models(): Array<Object3D> {
    return [
      this.board,
      this.arrows,
      ...this.robots,
    ]
  }
}
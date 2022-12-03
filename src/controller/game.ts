import { Color, Object3D } from "three";
import { Board, BoardParts, BoardTokens } from "../models/board";
import { Robot } from "../models/robot";
import { loadStlModels } from "../utils/load-models";
import { loadTextures } from "../utils/load-textures";

export class GameController {
  private board: Board
  private robots: Array<Robot>

  constructor(
    boardParts: BoardParts,
    boardTokens: BoardTokens,
    models: Awaited<ReturnType<typeof loadStlModels>>,
    textures: Awaited<ReturnType<typeof loadTextures>>
  ) {
    this.board = this.makeBoard(boardParts, boardTokens, textures)
    this.robots = this.makeRobots(models)
  }

  private makeBoard(parts: BoardParts, tokens: BoardTokens, textures: Awaited<ReturnType<typeof loadTextures>>): Board {
    const board = new Board(parts, tokens, textures)
    return board
  }

  private makeRobots(models: Awaited<ReturnType<typeof loadStlModels>>): Array<Robot> {
    const colors = [ new Color('yellow'), new Color('red'), new Color('green'), new Color('blue'), new Color('grey') ]
    return colors.map(color => new Robot(models, color))
  }

  public get models(): Array<Object3D> {
    return [
      this.board,
      ...this.robots
    ]
  }
}
import { Board, BoardParts, BoardTokens, WALL_TOP } from "../models/board";
import { Token } from "../models/token";
import { loadTextures } from "../utils/load-textures";

export class BoardController extends Board {
  constructor(parts: BoardParts, tokens: BoardTokens, private readonly textures: Awaited<ReturnType<typeof loadTextures>>) {
    super(parts, tokens, textures)
  }

  public setTargetToken(token: BoardTokens[number][number]) {
    this.getObjectByName('target')?.removeFromParent()

    const target = new Token(token, this.textures)
    target.name = 'target'
    target.rotation.y = target.rotation.z = Math.PI
    target.position.set(0, 0, WALL_TOP / 2 + 0.001)
    target.scale.set(1.6, 1.6, 1.6)

    this.add(target)
  }
}
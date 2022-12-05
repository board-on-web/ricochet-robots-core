import { Board, BoardParts, BoardTokens, WALL_TOP } from "../models/board";
import { Token } from "../models/token";
import { loadTextures } from "../utils/load-textures";

export class BoardController extends Board {
  private static readonly TARGET_TOKEN_KEY = 'target'

  constructor(parts: BoardParts, tokens: BoardTokens, private readonly textures: Awaited<ReturnType<typeof loadTextures>>) {
    super(parts, tokens, textures)
  }

  public setTargetToken(token: BoardTokens[number][number]) {
    this.removeTargetToken()

    const target = new Token(token, this.textures)
    target.name = BoardController.TARGET_TOKEN_KEY
    target.rotation.y = target.rotation.z = Math.PI
    target.position.set(0, 0, WALL_TOP / 2 + 0.001)
    target.scale.set(1.6, 1.6, 1.6)

    this.add(target)
  }
  
  public removeTargetToken() {
    this.getObjectByName(BoardController.TARGET_TOKEN_KEY)?.removeFromParent()
  }
}
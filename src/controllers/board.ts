import { Board, BoardParts, BoardToken, BoardTokens, WALL_TOP } from "../models/board";
import { Token } from "../models/token";
import { loadTextures } from "../utils/load-textures";

export class BoardController extends Board {
  private static readonly TOKEN_TARGET_KEY = 'target'

  constructor(parts: BoardParts, tokens: BoardTokens, private readonly textures: Awaited<ReturnType<typeof loadTextures>>) {
    super(parts, tokens, textures)
  }

  public set targetToken(token: BoardToken) {
    this.removeTargetToken()

    const target = new Token(token, this.textures)
    target.name = BoardController.TOKEN_TARGET_KEY
    target.rotation.y = target.rotation.z = Math.PI
    target.position.set(0, 0, WALL_TOP / 2 + 0.001)
    target.scale.set(1.6, 1.6, 1.6)

    this.add(target)
  }
  
  public removeTargetToken() {
    this.getObjectByName(BoardController.TOKEN_TARGET_KEY)?.removeFromParent()
  }
}
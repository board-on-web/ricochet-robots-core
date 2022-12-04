import { Board, BoardParts, BoardTokens } from "../models/board";
import { loadTextures } from "../utils/load-textures";

export class BoardController extends Board {
  constructor(parts: BoardParts, tokens: BoardTokens, textures: Awaited<ReturnType<typeof loadTextures>>) {
    super(parts, tokens, textures)
  }
}
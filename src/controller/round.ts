import { BoardTokens } from "../models/board";
import { MessagesController } from "./messages";

export type Turn = 'prepare' | 'planning' | 'presentation' | 'end-round'

export class RoundController {
  private _turn: Turn = 'prepare'
  private _targetTokens: Array<BoardTokens[number][number]>
  private _targetToken: BoardTokens[number][number] | null = null

  constructor(tokens: BoardTokens, private readonly mc: MessagesController) {
    this._targetTokens = tokens.flat(2).sort(() => Math.random() - 0.5)
  }

  public changeTurn(turn: Turn) {
    this._turn = turn
    this.mc.emit({
      event: 'change_turn',
      turn
    })
  }

  public makeNextToken(): BoardTokens[number][number] {
    const nextToken = this._targetTokens.pop()

    if (!nextToken) {
      throw this.mc.emit({
        event: 'end_game'
      })
    }

    this._targetToken = nextToken
    return this._targetToken
  }

  public get targetToken(): BoardTokens[number][number] | null {
    return this._targetToken
  }

  public get turn(): Turn {
    return this._turn
  }
}
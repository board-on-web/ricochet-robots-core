import { BoardTokens } from "../models/board";
import { MessagesController } from "./messages";

export type Turn = 'prepare' | 'planning' | 'waiting-better' | 'presentation'

export class RoundController {
  private _turn: Turn = 'prepare'
  private _targetTokens: Array<BoardTokens[number][number]>
  private _targetToken: BoardTokens[number][number]

  constructor(tokens: BoardTokens, private readonly mc: MessagesController) {
    this._targetTokens = tokens
      .flat(2)
      .sort(() => Math.random() - 0.5)
   
    this.nextToken()
    this._targetToken = this.targetToken
  }

  public changeTurn(turn: Turn) {
    this._turn = turn
    this.mc.emit({
      event: 'change_turn',
      turn
    })
  }

  public nextToken() {
    const nextToken = this._targetTokens.pop()

    if (!nextToken) {
      return this.mc.emit({
        event: 'end_game'
      })
    }

    this._targetToken = nextToken
  }

  public get targetToken(): BoardTokens[number][number] {
    return this._targetToken
  }

  public get turn(): Turn {
    return this._turn
  }
}
import { BoardTokens } from "../models/board";

type Turn = 'prepare' | 'planning' | 'waiting-better' | 'presentation'

export class RoundController {
  private _turn: Turn = 'prepare'
  private _targetTokens: Array<BoardTokens[number][number]>
  private _targetToken: BoardTokens[number][number]

  private _whenChangeTurn: ((turn: Turn) => void) | null = null
  private _whenEndRound: (() => void) | null = null
  private _whenEndGame: (() => void) | null = null

  constructor(tokens: BoardTokens) {
    this._targetTokens = tokens
      .flat(2)
      .sort(() => Math.random() - 0.5)
   
    this.nextToken()
    this._targetToken = this.targetToken
  }

  public changeTurn(turn: Turn) {
    this._turn = turn
    this._whenChangeTurn?.(turn)
  }

  public nextToken() {
    const nextToken = this._targetTokens.pop()

    if (!nextToken) {
      return this._whenEndGame?.()
    }

    this._targetToken = nextToken
  }

  public whenEndRound(whenEndRound: () => void) {
    this._whenEndRound = whenEndRound
  }

  public whenEndGame(whenEndGame: () => void) {
    this._whenEndGame = whenEndGame
  }

  public whenChangeTurn(whenChangeTurn: (turn: Turn) => void) {
    this._whenChangeTurn = whenChangeTurn
  }

  public emitEndRound() {
    this._whenEndRound?.()
  }

  public get targetToken(): BoardTokens[number][number] {
    return this._targetToken
  }

  public get turn(): Turn {
    return this._turn
  }
}
import { BoardToken, BoardTokens } from "../models/board";
import { MessagesController } from "./messages";
import { IState } from "./state";
import { State } from "../models/state";
import { TokenType } from "../types/token";

export class TokensController implements IState<Omit<State, 'robots'>> {
  private initialTokens: Array<BoardToken>
  private _tokens: Array<BoardToken> = []
  private _target: BoardToken | null = null

  constructor(initialTokens: BoardTokens, private readonly mc: MessagesController) {
    this.initialTokens = initialTokens.flat(2).sort(() => Math.random() - 0.5)
  }

  public getNextToken(): BoardToken {
    const nextToken = this._tokens.pop()

    if (!nextToken) {
      throw this.mc.emit({
        event: 'end_game'
      })
    }

    this._target = nextToken
    return this._target
  }

  public prepare(): this {
    this._tokens = this.initialTokens.slice()
    return this
  }

  public get target(): BoardToken | null {
    return this._target
  }

  public restore(state: Omit<State, "robots">): void {
    this._tokens = state.tokens.map(it => this.initialTokens.find(initial => it === initial.token)).filter(Boolean) as Array<BoardToken>
    this._target = this.initialTokens.find(initial => state.target === initial.token) as BoardToken

    if (!this._target) {
      throw new Error('Cant restore tokens')
    }
  }

  public get state(): Omit<State, "robots"> {
    return {
      target: this._target?.token as TokenType,
      tokens: this._tokens.map(it => it.token as TokenType)
    }
  }
}
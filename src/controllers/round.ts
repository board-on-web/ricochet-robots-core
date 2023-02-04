import { BoardToken } from "../models/board";
import { IState } from "../types/state";
import { State } from "../models/state";
import { TokenType } from "../types/token";

export class TokensController implements IState<Omit<State, 'robots'>> {
  private _target: BoardToken | null = null

  constructor(private tokens: BoardToken[]) {}

  public get target(): BoardToken | null {
    return this._target
  }

  public restore(state: Omit<State, "robots">): void {
    this._target = this.tokens.find(it => state.target === it.token) as BoardToken
  }

  public get state(): Omit<State, "robots"> {
    return {
      target: this._target?.token as TokenType,
    }
  }
}
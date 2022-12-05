import { Turn } from "../types/turn"
import { BoardTokens } from "./board"
import { State } from "./state"

export interface MessageCommitState {
  event: 'commit_state',
  state: State
}

export interface MessageChangeTurn {
  event: 'change_turn',
  turn: Turn
}

interface MessageEndGame {
  event: 'end_game'
}

interface MessageNextToken {
  event: 'next_token',
  token: BoardTokens[number][number]
}

export type Message = 
  MessageChangeTurn
    | MessageEndGame
    | MessageNextToken
    | MessageCommitState
import { Turn } from "../controller/round"
import { BoardTokens } from "./board"

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
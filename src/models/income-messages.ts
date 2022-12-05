import { MessageChangeTurn } from "./messages"

interface MessagePrepareGame {
  event: 'prepare'
}

interface IncomeMessageChangeTurn extends MessageChangeTurn {
  turn: 'end-round'
}

export type IncomeMessage = 
  IncomeMessageChangeTurn
    | MessagePrepareGame
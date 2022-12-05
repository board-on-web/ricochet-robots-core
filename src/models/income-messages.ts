import { MessageChangeTurn } from "./messages"

interface IncomeMessageChangeTurn extends MessageChangeTurn {
  turn: 'end-round'
}

export type IncomeMessage = 
  IncomeMessageChangeTurn
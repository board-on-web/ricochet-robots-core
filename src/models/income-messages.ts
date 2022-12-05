import { MessageChangeTurn } from "./messages"

interface MessagePrepareGame {
  event: 'prepare'
}

interface MessageHideRobots {
  event: 'hide-robots'
}

interface MessageShowRobots {
  event: 'show-robots'
}

interface IncomeMessageChangeTurn extends MessageChangeTurn {
  turn: 'end-round'
}

export type IncomeMessage = 
  IncomeMessageChangeTurn
    | MessagePrepareGame
    | MessageHideRobots
    | MessageShowRobots
import { MessageChangeTurn } from "./messages"
import { State } from "./state"

export interface MessageRestoreState {
  event: 'restore_state',
  state: State
}

interface MessagePrepareGame {
  event: 'prepare'
}

interface MessageHideRobots {
  event: 'hide-robots'
}

interface MessageShowRobots {
  event: 'show-robots'
}

interface ChangeTurn extends MessageChangeTurn {
  turn: 'end-round'
}

export type IncomeMessage = 
  ChangeTurn
    | MessagePrepareGame
    | MessageHideRobots
    | MessageShowRobots
    | MessageRestoreState

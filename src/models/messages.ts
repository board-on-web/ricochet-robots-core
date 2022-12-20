import { Turn } from "../types/turn"
import { BoardToken } from "./board"
import { State } from "./state"

type RestoreStateMessage = {
  event: 'restore_state',
  state: State
}

type PrepareGameMessage = {
  event: 'prepare'
}

type DisableRobotsMessage = {
  event: 'disable_robots'
}

type EnableRobotsMessage = {
  event: 'enable_robots'
}

type HideRobotsMessage = {
  event: 'hide_robots'
}

type ShowRobotsMessage = {
  event: 'show_robots'
}

export type CommitStateMessage = {
  event: 'commit_state',
  state: State
}

export type ChangeTurnMessage = {
  event: 'change_turn',
  turn: Turn
}

type NextTokenMessage = {
  event: 'next_token',
  token: BoardToken
}

type EndGameMessage = {
  event: 'end_game'
}

export type Message = 
  ChangeTurnMessage
    | PrepareGameMessage
    | DisableRobotsMessage
    | EnableRobotsMessage
    | HideRobotsMessage
    | ShowRobotsMessage
    | RestoreStateMessage
    | NextTokenMessage
    | CommitStateMessage
    | EndGameMessage
import { Vec2 } from "three"
import { Phase } from "../types/phase"
import { BoardToken } from "./board"
import { State } from "./state"

type PrepareGameMessage = {
  event: 'prepare'
  // initial robots positions
  positions: Vec2[]
}

type CmdGeneratePositionsMessage = {
  event: 'cmd:generate_positions'
}

type GeneratePositionsMessage = {
  event: 'generate_positions'
  // initial robots positions
  positions: Vec2[]
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

type RestoreStateMessage = {
  event: 'restore_state',
  state: State
}

export type ChangePhaseMessage = {
  event: 'change_phase',
  phase: Phase
}

type SetTokenMessage = {
  event: 'set_token',
  token: BoardToken
}

type EndGameMessage = {
  event: 'end_game'
}

export type Message = 
  PrepareGameMessage
    | SetTokenMessage
    | CmdGeneratePositionsMessage
    | GeneratePositionsMessage
    | ChangePhaseMessage
    | HideRobotsMessage
    | ShowRobotsMessage
    | CommitStateMessage
    | RestoreStateMessage
    | EndGameMessage
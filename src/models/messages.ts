import { Vec2 } from "three"
import { Phase } from "../types/phase"
import { BoardToken } from "./board"
import { State } from "./state"

type CmdGeneratePositionsMessage = {
  event: 'cmd:generate_positions'
}

type CmdGetTokensMessage = {
  event: 'cmd:get_tokens'
}

type SetRobotsPositionsGameMessage = {
  event: 'set_robots_positions'
  // initial robots positions
  positions: Vec2[]
}

type GeneratePositionsMessage = {
  event: 'generate_positions'
  // initial robots positions
  positions: Vec2[]
}

type GetTokensMessage = {
  event: 'get_tokens'
  tokens: BoardToken[]
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
  SetRobotsPositionsGameMessage
    | SetTokenMessage
    | GeneratePositionsMessage
    | GetTokensMessage
    | ChangePhaseMessage
    | HideRobotsMessage
    | ShowRobotsMessage
    | CommitStateMessage
    | RestoreStateMessage
    | EndGameMessage
    | CmdGeneratePositionsMessage
    | CmdGetTokensMessage
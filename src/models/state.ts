import { Vec2 } from "three"
import { RobotColor } from "../types/robot"
import { TokenType } from "../types/token"

export interface RobotStateDto {
  type: RobotColor
  position: Vec2
}

export interface State {
  robots: Array<RobotStateDto>
  tokens: Array<TokenType>
  target: TokenType
}
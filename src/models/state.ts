import { Vec2 } from "three"
import { TokenType } from "../types/token"
import robotsDescription from '../assets/robots.json'

export interface RobotStateDto {
  robot: keyof typeof robotsDescription
  position: Vec2
}

export interface State {
  robots: Array<RobotStateDto>
  target: TokenType
}
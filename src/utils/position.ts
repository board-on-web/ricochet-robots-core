import { Vec2 } from "three"
import { CELL_SIZE } from "../models/board"

export function coordsByPosition(position: Vec2): Vec2 {
  return {
    x: CELL_SIZE * (position.x - 7.5),
    y: CELL_SIZE * (position.y - 7.5)
  }
}

export function positionByCoords(position: Vec2): Vec2 {
  return {
    x: position.x / CELL_SIZE + 7.5,
    y: position.y / CELL_SIZE + 7.5
  }
}
import { Vec2, Vector3 } from "three"
import { Board, BoardParts, BOARD_SIZE, CELL_SIZE_HALF, CELL_SIZE } from "./board"
import { Robot } from "./robot"

export class Map {
  public generate(board: Board, robots: Array<Robot>): BoardParts[number] {
    const wallsPositions: Array<Vec2> = []
    
    board.traverse((object) => {
      if (object.name === 'wall') {
        const worldPosition = new Vector3()
        object.getWorldPosition(worldPosition)
        wallsPositions.push({
          x: Math.round(worldPosition.x * 10000) / 10000,
          y: Math.round(worldPosition.z * 10000) / 10000,
        })
      }      
    })

    return Array.from({ length: BOARD_SIZE }, (_, y) => {
      return Array.from({ length: BOARD_SIZE }, (_, x) => {
        const position = this.positionByCoords({ x, y })
        let value = 0

        const isLeft = x === 0
        const isTop = y === 0
        const isRight = x === BOARD_SIZE - 1
        const isBottom = y === BOARD_SIZE - 1

        const isCenter = [7, 8].includes(x) && [7, 8].includes(y)
        const isCenterRight = x === 6 && [7, 8].includes(y)
        const isCenterBottom = y === 6 && [7, 8].includes(x)
        const isCenterLeft = x === 9 && [7, 8].includes(y)
        const isCenterTop = y === 9 && [7, 8].includes(x)

        const hasLeftWall = wallsPositions.find(it => it.x === position.x - CELL_SIZE_HALF && it.y === position.y)
        const hasTopWall = wallsPositions.find(it => it.x === position.x && it.y === position.y - CELL_SIZE_HALF)
        const hasRightWall = wallsPositions.find(it => it.x === position.x + CELL_SIZE_HALF && it.y === position.y)
        const hasBottomWall = wallsPositions.find(it => it.x === position.x && it.y === position.y + CELL_SIZE_HALF)
        
        const isRobot = robots.find(it => it.coords.x === x && it.coords.y === y)
        const isRobotRight = robots.find(it => it.coords.x === x + 1 && it.coords.y === y)
        const isRobotBottom = robots.find(it => it.coords.x === x && it.coords.y === y + 1)
        const isRobotLeft = robots.find(it => it.coords.x === x - 1 && it.coords.y === y)
        const isRobotTop = robots.find(it => it.coords.x === x && it.coords.y === y - 1)

        if (isCenter || isRobot) {
          return value = 15
        }

        // left
        if (isLeft || isCenterLeft || isRobotLeft || hasLeftWall) {
          value += 8
        }

        // top
        if (isTop || isCenterTop || isRobotTop || hasTopWall) {
          value += 4
        }

        // right
        if (isRight || isCenterRight || isRobotRight || hasRightWall) {
          value += 2
        }

        // bottom
        if (isBottom || isCenterBottom || isRobotBottom || hasBottomWall) {
          value += 1
        }

        return value
      })
    })
  }

  public positionByCoords(position: Vec2): Vec2 {
    return {
      x: CELL_SIZE * (position.x - 7.5),
      y: CELL_SIZE * (position.y - 7.5)
    }
  }
  
  public coordsByPosition(position: Vec2): Vec2 {
    return {
      x: position.x / CELL_SIZE + 7.5,
      y: position.y / CELL_SIZE + 7.5
    }
  }

  public calcRouteToByDirection(from: Vec2, direction: number, description: BoardParts[number]): Vec2 {
    let next: Vec2 = { ...from }

    while (this.hasMoveByDirection(next, direction, description)) {
      next = this.moveStepByDirection(next, direction)
    }

    return next
  }

  private hasMoveByDirection(from: Vec2, direction: number, description: BoardParts[number]): boolean {
    return !Boolean(description[from.y][from.x] >> (3 - direction) & 1)
  }

  private moveStepByDirection(from: Vec2, direction: number): Vec2 {
    const next = { ...from }

    switch (direction) {
      case 0:
        next.x -= 1
        break
      
      case 1:
        next.y -= 1
        break

      case 2:
        next.x += 1
        break

      case 3:
        next.y += 1
        break
    }

    return next
  }
}
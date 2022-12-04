import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Vec2, Vector3 } from "three";
import boardDescription from '../assets/boards/board_1.json'
import boardTokensDescription from '../assets/boards/board_1_tokens.json'
import { loadTextures } from "../utils/load-textures";
import { Robot } from "./robot";

export type BoardParts = typeof boardDescription
export type BoardTokens = typeof boardTokensDescription

export const BOARD_SIZE = 16
export const BOARD_CELL_SIZE = 1 / BOARD_SIZE
export const CELL_COUNT = 8
export const CELL_SIZE = 1 / CELL_COUNT
export const CELL_SIZE_HALF = CELL_SIZE / 2
const WALL_HEIGHT = 0.015
const WALL_WIDTH = CELL_SIZE - WALL_HEIGHT
const SIDE_MATERIAL = new MeshBasicMaterial({ color: '#B0BEC5' })
const TOP_MATERIAL = new MeshBasicMaterial({ color: '#607D8B' })
const WALL_MATERIALS = [
  SIDE_MATERIAL,
  SIDE_MATERIAL,
  SIDE_MATERIAL,
  SIDE_MATERIAL,
  SIDE_MATERIAL,
  TOP_MATERIAL
]
const SIDE_TEMPLATE = new Mesh(
  new BoxGeometry(1, WALL_HEIGHT, 0.1),
  WALL_MATERIALS
)
const WALL_TEMPLATE = new Mesh(
  new BoxGeometry(WALL_WIDTH, WALL_HEIGHT, 0.1),
  WALL_MATERIALS
)
const CORNER_TEMPLATE = new Mesh(
  new BoxGeometry(WALL_HEIGHT, WALL_HEIGHT, 0.1),
  WALL_MATERIALS
)
const TOKEN_GEOMETRY = new PlaneGeometry(CELL_SIZE * 0.95, CELL_SIZE * 0.95)

export class Board extends Group {
  constructor(parts: BoardParts, tokens: BoardTokens, textures: Awaited<ReturnType<typeof loadTextures>>) {
    super()
    
    this.name = 'board'
    this.rotation.x = -90 * (Math.PI / 180)
    // add walls on board
    this.add(...this.walls(parts, tokens, textures))
  }

  private walls(partsModel: BoardParts, tokensModel: BoardTokens, textures: Awaited<ReturnType<typeof loadTextures>>) {
    return partsModel.map((part, index) => {
      const tokens = tokensModel[index].map(token => {
        const mesh = new Mesh(
          TOKEN_GEOMETRY,
          // @ts-ignore token.token is valid
          new MeshBasicMaterial({ map: textures[token.token], transparent: true })
        )
        mesh.name = 'token'
        mesh.userData = {
          type: token.token,
          color: token.color
        }
        mesh.rotation.x = -180 * (Math.PI / 180)
        mesh.position.set(token.position[0] * CELL_SIZE, token.position[1] * CELL_SIZE, -0.001)

        return mesh
      })

      const walls = part.flatMap((column, i, { length: cl }): Array<Mesh> => {
        return column.reduce((acc, item, j, { length: rl }): Array<Mesh> => {
          const isFirstInColumn = i === 0
          const isFirstInRow = j === 0
          const isLastInColumn = i === cl - 1
          const isLastInRow = j === rl - 1

          if (item === 15) {
            const mesh = new Mesh(
              new BoxGeometry(WALL_WIDTH + WALL_HEIGHT, WALL_WIDTH + WALL_HEIGHT, 0.1),
              WALL_MATERIALS
            )
            mesh.position.set(j * CELL_SIZE, i * CELL_SIZE, 0)
            acc.push(mesh)

            return acc
          }

          // FYI (2022.12.02): Only for first cell in row
          // left wall
          if (item >> 3 & 1 && isFirstInRow) {
            const wall = WALL_TEMPLATE.clone()
            wall.name = 'wall'
            wall.rotation.z = 90 * (Math.PI / 180)
            wall.position.set(j * CELL_SIZE - CELL_SIZE_HALF, i * CELL_SIZE, 0)
            acc.push(wall)
          }

          // FYI (2022.12.02): Only for first cell in column
          // top wall
          if (item >> 2 & 1 && isFirstInColumn) {
            const wall = WALL_TEMPLATE.clone()
            wall.name = 'wall'
            wall.position.set(j * CELL_SIZE, i * CELL_SIZE - CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          // right wall
          if (item >> 1 & 1 && !isLastInRow) {
            const wall = WALL_TEMPLATE.clone()
            wall.name = 'wall'
            wall.rotation.z = 90 * (Math.PI / 180)
            wall.position.set(j * CELL_SIZE + CELL_SIZE_HALF, i * CELL_SIZE, 0)
            acc.push(wall)
          }

          // bottom wall
          if (item >> 0 & 1 && !isLastInColumn) {
            const wall = WALL_TEMPLATE.clone()
            wall.name = 'wall'
            wall.position.set(j * CELL_SIZE, i * CELL_SIZE + CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          // left-top corner
          if ((item >> 2 & 3) === 3) {
            const corner = CORNER_TEMPLATE.clone()
            corner.position.set(j * CELL_SIZE - CELL_SIZE_HALF, i * CELL_SIZE - CELL_SIZE_HALF, 0)
            acc.push(corner)
          }

          // right-top corner
          if ((item >> 1 & 3) === 3 && !isLastInRow) {
            const corner = CORNER_TEMPLATE.clone()
            corner.position.set(j * CELL_SIZE + CELL_SIZE_HALF, i * CELL_SIZE - CELL_SIZE_HALF, 0)
            acc.push(corner)
          }

          // right-bottom corner
          if (((item >> 0 & 3) === 3) && !isLastInRow && !isLastInColumn) {
            const corner = CORNER_TEMPLATE.clone()
            corner.position.set(j * CELL_SIZE + CELL_SIZE_HALF, i * CELL_SIZE + CELL_SIZE_HALF, 0)
            acc.push(corner)
          }

          // left-bottom corner
          if ((item >> 3 & 1) & (item >> 0 & 1) && !isLastInColumn) {
            const corner = CORNER_TEMPLATE.clone()
            corner.position.set(j * CELL_SIZE - CELL_SIZE_HALF, i * CELL_SIZE + CELL_SIZE_HALF, 0)
            acc.push(corner)
          }

          return acc
        }, [] as Array<Mesh>)
      })

      // board frame
      const bottomSide = SIDE_TEMPLATE.clone()
      bottomSide.position.set(0.5 - CELL_SIZE_HALF + WALL_HEIGHT / 2, 1 - CELL_SIZE_HALF, 0)
      const rightSide = SIDE_TEMPLATE.clone()
      rightSide.rotation.z = 90 * (Math.PI / 180)
      rightSide.position.set(1 - CELL_SIZE_HALF, 0.5 - CELL_SIZE_HALF - WALL_HEIGHT / 2, 0)
      
      // rotate tokens to face
      tokens.forEach(it => {
        it.rotation.z = index * 90 * (Math.PI / 180)
      })

      const group = new Group()
      // centring group
      group.position.set(CELL_SIZE_HALF, -CELL_SIZE_HALF, 0)
      group.rotation.x = Math.PI
      group.add(
        ...walls,
        bottomSide,
        rightSide,
        ...tokens,
      )

      const planeGeometry = new PlaneGeometry()
      planeGeometry.translate(0.5, -0.5, 0)
      const plane = new Mesh(planeGeometry, new MeshBasicMaterial({ map: textures['board'] }))
      plane.name = `part_${index}`
      plane.rotation.z = index * 90 * (Math.PI / 180) * -1
      plane.add(group)

      return plane
    })
  }

  public get tokens(): Array<Object3D> {
    const tokens: Array<Object3D> = []
    
    this.traverse((object) => {
      if (object.name === 'token') {
        tokens.push(object)
      }      
    })

    return tokens
  }
}

export class BoardDescription {
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
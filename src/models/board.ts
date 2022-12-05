import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import boardDescription from '../assets/boards/board_1.json'
import boardTokensDescription from '../assets/boards/board_1_tokens.json'
import { loadTextures } from "../utils/load-textures";
import { Token } from "./token";
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { Map } from "./map";

export type BoardParts = typeof boardDescription
export type BoardTokens = typeof boardTokensDescription

export const BOARD_SIZE = 16
export const BOARD_CELL_SIZE = 1 / BOARD_SIZE
export const CELL_COUNT = 8
export const CELL_SIZE = 1 / CELL_COUNT
export const CELL_SIZE_HALF = CELL_SIZE / 2
export const WALL_TOP = 0.1
const WALL_HEIGHT = 0.015
const WALL_WIDTH = CELL_SIZE - WALL_HEIGHT
const SIDE_MATERIAL = new MeshBasicMaterial({ color: '#B0BEC5' })
const TOP_MATERIAL = new MeshBasicMaterial({ color: '#607D8B' })
const WALL_MATERIALS = [
  SIDE_MATERIAL,
  SIDE_MATERIAL,
  SIDE_MATERIAL,
  SIDE_MATERIAL,
  TOP_MATERIAL,
  TOP_MATERIAL
]
const SIDE_TEMPLATE = new Mesh(
  new BoxGeometry(BOARD_SIZE * BOARD_CELL_SIZE, WALL_HEIGHT, WALL_TOP),
  WALL_MATERIALS
)
const WALL_TEMPLATE = new Mesh(
  new BoxGeometry(WALL_WIDTH, WALL_HEIGHT, WALL_TOP),
  WALL_MATERIALS
)
const CORNER_TEMPLATE = new Mesh(
  new BoxGeometry(WALL_HEIGHT, WALL_HEIGHT, WALL_TOP),
  WALL_MATERIALS
)
const NOTATION_OFFSET = 0.04

export class Board extends Group {
  private readonly map = new Map()

  constructor(parts: BoardParts, tokens: BoardTokens, textures: Awaited<ReturnType<typeof loadTextures>>) {
    super()
    
    this.name = 'board'
    this.rotation.x = -90 * (Math.PI / 180)
    // add walls on board
    this.add(...this.walls(parts, tokens, textures))
    // add board notations
    this.add(...this.notations)
  }

  private walls(partsModel: BoardParts, tokensModel: BoardTokens, textures: Awaited<ReturnType<typeof loadTextures>>) {
    return partsModel.map((part, index) => {
      const tokens = tokensModel[index].map(model => new Token(model, textures))

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

  private get notations(): Array<CSS2DObject> {
    return [
      Array(BOARD_SIZE).fill(undefined).map((_, index) => {
        const item = document.createElement('span')
        item.innerText = String.fromCharCode(65 + index)

        const object = new CSS2DObject(item)
        const coords = this.map.positionByCoords({ x: 0 + index, y: 16 })
        object.position.set(coords.x, coords.y + NOTATION_OFFSET, 0)
        return object
      }),
      Array(BOARD_SIZE).fill(undefined).map((_, index) => {
        const item = document.createElement('span')
        item.innerText = String(index + 1).padStart(2, ' ') // &nbsp;

        const object = new CSS2DObject(item)
        const coords = this.map.positionByCoords({ x: -1, y: 15 - index })
        object.position.set(coords.x - NOTATION_OFFSET, coords.y, 0)
        return object
      })
    ].flat()
  }

  public get tokens(): Array<Token> {
    const tokens: Array<Token> = []
    
    this.traverse((object) => {
      if (object.name === 'token' && object instanceof Token) {
        tokens.push(object)
      }      
    })

    return tokens
  }
}

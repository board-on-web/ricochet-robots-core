import { BoxGeometry, Group, Material, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

const CELL_COUNT = 8
const CELL_SIZE = 1 / CELL_COUNT
const CELL_SIZE_HALF = CELL_SIZE / 2
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
const WALL_TEMPLATE = new Mesh(
  new BoxGeometry(WALL_WIDTH, WALL_HEIGHT, 0.1),
  WALL_MATERIALS
)
const CORNER_TEMPLATE = new Mesh(
  new BoxGeometry(WALL_HEIGHT, WALL_HEIGHT, 0.1),
  WALL_MATERIALS
)

export class Board extends Group {
  constructor(parts: Array<Array<Array<number>>>, material: Material) {
    super()
    
    const items: Array<Mesh> = parts.map((part, index) => {
      const walls = part.flatMap((column, i): Array<Mesh> => {
        return column.reduce((acc, row, j): Array<Mesh> => {
          const isFirstInColumn = i === 0
          const isFirstInRow = j === 0

          if (row === 15) {
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
          if (row >> 3 & 1 && isFirstInRow) {
            const wall = WALL_TEMPLATE.clone()
            wall.rotation.z = 90 * (Math.PI / 180)
            wall.position.set(j * CELL_SIZE - CELL_SIZE_HALF, i * CELL_SIZE, 0)
            acc.push(wall)
          }

          // FYI (2022.12.02): Only for first cell in column
          // top wall
          if (row >> 2 & 1 && isFirstInColumn) {
            const wall = WALL_TEMPLATE.clone()
            wall.position.set(j * CELL_SIZE, i * CELL_SIZE - CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          // right wall
          if (row >> 1 & 1) {
            const wall = WALL_TEMPLATE.clone()
            wall.rotation.z = 90 * (Math.PI / 180)
            wall.position.set(j * CELL_SIZE + CELL_SIZE_HALF, i * CELL_SIZE, 0)
            acc.push(wall)
          }

          // bottom wall
          if (row >> 0 & 1) {
            const wall = WALL_TEMPLATE.clone()
            wall.position.set(j * CELL_SIZE, i * CELL_SIZE + CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          // left-top corner
          if ((row >> 2 & 3) === 3) {
            const wall = CORNER_TEMPLATE.clone()
            wall.position.set(j * CELL_SIZE - CELL_SIZE_HALF, i * CELL_SIZE - CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          // right-top corner
          if ((row >> 1 & 3) === 3) {
            const wall = CORNER_TEMPLATE.clone()
            wall.position.set(j * CELL_SIZE + CELL_SIZE_HALF, i * CELL_SIZE - CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          // right-bottom corner
          if ((row >> 0 & 3) === 3) {
            const wall = CORNER_TEMPLATE.clone()
            wall.position.set(j * CELL_SIZE + CELL_SIZE_HALF, i * CELL_SIZE + CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          // left-bottom corner
          if ((row >> 3 & 1) & (row >> 0 & 1)) {
            const wall = CORNER_TEMPLATE.clone()
            wall.position.set(j * CELL_SIZE - CELL_SIZE_HALF, i * CELL_SIZE + CELL_SIZE_HALF, 0)
            acc.push(wall)
          }

          return acc
        }, [] as Array<Mesh>)
      })
      
      const group = new Group()
      // centring group
      group.position.set(CELL_SIZE_HALF, -CELL_SIZE_HALF, 0)
      group.rotation.x = Math.PI
      group.add(...walls)

      const planeGeometry = new PlaneGeometry()
      planeGeometry.translate(0.5, -0.5, 0)
      const plane = new Mesh(planeGeometry, material)
      plane.name = `part_${index}`
      plane.rotation.z = index * 90 * (Math.PI / 180)
      plane.add(group)

      return plane
    })

    this.name = 'board'
    this.add(...items)
    this.rotation.x = -90 * (Math.PI / 180)
  }
}
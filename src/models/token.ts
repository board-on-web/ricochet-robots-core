import { Mesh, MeshBasicMaterial, PlaneGeometry, Vec2, Vector3 } from "three"
import { loadTextures } from "../utils/load-textures"
import { BoardToken, CELL_SIZE } from "./board"
import { Map } from "./map"

export class Token extends Mesh {
  constructor(token: BoardToken, textures: Awaited<ReturnType<typeof loadTextures>>) {
    super(
      new PlaneGeometry(CELL_SIZE * 0.95, CELL_SIZE * 0.95),
      new MeshBasicMaterial({ map: textures[token.token as keyof typeof textures], transparent: true })
    )
    
    this.name = 'token'
    this.userData = {
      type: token.token,
      color: token.color
    }
    this.rotation.x = -180 * (Math.PI / 180)
    this.position.set(token.position[0] * CELL_SIZE, token.position[1] * CELL_SIZE, -0.001)
  }

  public get coords(): Vec2 {
    const worldPosition = new Vector3()
    this.getWorldPosition(worldPosition)

    return new Map().coordsByPosition({
      x: Math.round(worldPosition.x * 10000) / 10000,
      y: Math.round(worldPosition.z * 10000) / 10000,
    })
  }
}

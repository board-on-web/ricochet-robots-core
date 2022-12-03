import { Box3, Color, Mesh, MeshBasicMaterial, Vec2 } from "three";
import { loadStlModels } from "../utils/load-models";
import { CELL_SIZE } from "./board";

export class Robot extends Mesh {
  constructor(models: Awaited<ReturnType<typeof loadStlModels>>, color: Color) {
    super(models['robot'].center(), new MeshBasicMaterial({ color }))

    this.rotation.x = -90 * (Math.PI / 180)
    this.scale.set(0.005, 0.005, 0.005)
    
    const box = new Box3().setFromObject(this)
    this.position.y = box.max.y
  }

  /**
   * @param {Vec2} position x and y between [0; 15]
   */
  public moveTo(position: Vec2) {
    this.position.x = CELL_SIZE * (position.x - 7.5)
    this.position.z = CELL_SIZE * (position.y - 7.5)
  }
}
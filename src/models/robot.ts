import { Easing, Tween } from "@tweenjs/tween.js";
import { Box3, Color, Material, Mesh, MeshBasicMaterial, Vec2 } from "three";
import { loadStlModels } from "../utils/load-models";
import { Map } from "./map";

export class Robot extends Mesh {
  private boardDescription = new Map()

  constructor(models: Awaited<ReturnType<typeof loadStlModels>>, color: Color) {
    super(models['robot'].center(), new MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }))
    this.name = 'robot'

    this.rotation.x = -90 * (Math.PI / 180)
    this.scale.set(0.005, 0.005, 0.005)
    
    const box = new Box3().setFromObject(this)
    this.position.y = box.max.y
  }

  /**
   * @param {Vec2} position x and y between [0; 15]
   */
  public moveTo(position: Vec2) {
    const coords = this.boardDescription.positionByCoords(position)
    
    return new Tween({ x: this.position.x, y: this.position.z })
      .to(coords, 300)
      .easing(Easing.Circular.InOut)
      .onUpdate(({ x, y }) => {
        this.position.x = x
        this.position.z = y
      })
      .start()
  }

  public markUnselect() {
    (this.material as Material).opacity = 0.7
  }

  public markSelect() {
    (this.material as Material).opacity = 0.9
  }

  public get coords(): Vec2 {
    return this.boardDescription.coordsByPosition({
      x: this.position.x,
      y: this.position.z,
    })
  }
}
import { Box3, ExtrudeGeometry, Mesh, MeshBasicMaterial, Shape } from "three";

const HEIGHT = 0.15

export class Arrow extends Mesh {
  constructor(shape: Array<Shape>) {
    super(
      new ExtrudeGeometry(shape, {
        depth: 0.05,
      }),
      new MeshBasicMaterial({
        color: '#F06292',
        opacity: 0.7,
        transparent: true,
      })
    )
    this.name = 'arrow'
    
    this.rotation.x = 90 * (Math.PI / 180)
    this.position.y = HEIGHT
    this.scale.set(0.06, 0.038, 0.05)
    
    const box = new Box3().setFromObject(this)
    this.position.y = box.max.y
  }
}

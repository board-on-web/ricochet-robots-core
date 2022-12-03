import { Box3, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, Shape, Vec2 } from "three";

const HEIGHT = 0.15
const GAP = 0.2

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
    
    this.rotation.x = 90 * (Math.PI / 180)
    this.position.y = HEIGHT
    this.scale.set(0.05, 0.05, 0.05)
    
    const box = new Box3().setFromObject(this)
    this.position.y = box.max.y
  }
}

export class Arrows extends Group {
  constructor(arrow: Arrow) {    
    const arrows = Array.from({ length: 4 }, (_, index) => {
      const targetArrow = arrow.clone()
      targetArrow.userData = {
        type: 'arrow',
        // direction [ 3 0 1 2 ]
        direction: index === 3 ? 0 : index + 1
      }
      targetArrow.rotation.z = index * 90 * (Math.PI / 180)
      
      targetArrow.position.x = Math.abs((index & 1)) * GAP * Math.sign(2 - index)
      targetArrow.position.z = Math.abs((index & 1) - 1) * GAP * Math.sign(index - 1)

      return targetArrow
    })

    super()
    this.add(...arrows)
  }

  public moveTo(position: Vec2) {
    this.position.x = position.x
    this.position.z = position.y
  }

  public visibleByDirection(direction: number) {
    this.children
      .forEach((it) => {
        it.visible = !Boolean(direction >> (3 - it.userData.direction) & 1)
      })
  }

  public show() {
    this.visibleByDirection(0)
  }

  public hide() {
    this.visibleByDirection(15)
  }
}
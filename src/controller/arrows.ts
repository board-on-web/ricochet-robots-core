import { Group } from "three";
import { Arrow } from "../models/arrow";
import { Robot } from "../models/robot";
import { Direction } from "../types/direction";

const GAP = 0.17

export class ArrowsController extends Group {
  constructor(arrow: Arrow) {    
    const arrows = Array.from({ length: 4 }, (_, index) => {
      const targetArrow = arrow.clone()
      targetArrow.userData = {
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

  public moveToRobot(robot: Robot) {
    this.position.x = robot.position.x
    this.position.z = robot.position.z
  }

  public visibleByDirection(directions: number) {
    this.children.forEach((it) => {
      it.visible = !Boolean(directions >> (3 - it.userData.direction) & 1)
    })
  }

  public show() {
    this.visibleByDirection(0)
  }

  public hide() {
    this.visibleByDirection(15)
  }

  public isArrowVisible(direction: Direction) {
    return this.children.find(it => it.userData.direction === direction)?.visible
  }
}
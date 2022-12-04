import { Color } from 'three'
import robotsDescription from '../assets/robots.json'
import { Robot } from '../models/robot'
import { loadStlModels } from '../utils/load-models'

export class RobotsController extends Array<Robot> {
  private _selectedRobot: Robot | null = null

  public make(robots: typeof robotsDescription, models: Awaited<ReturnType<typeof loadStlModels>>) {
    const items = robots.map(it => {
      const robot = new Robot(models, new Color(it.color))
      robot.userData = {
        type: it.name,
        tint: it.tint
      }

      return robot
    })
    
    this.splice(0)
    this.push(...items)

    return this
  }

  public setSelectedRobot(robot: Robot) {
    this.forEach(it => it.markUnselect());

    this._selectedRobot = robot
    this._selectedRobot.markSelect()
  }

  public clearSelectedRobot() {
    this.forEach(it => it.markUnselect());
    
    this._selectedRobot = null
  }

  public get selectedRobot(): typeof this._selectedRobot {
    return this._selectedRobot
  }

  // return next by order robot
  public get nextRobot(): Robot {
    const idx = this.selectedRobot ? this.indexOf(this.selectedRobot) : -1
    return (idx + 1 >= this.length) || (idx === -1)
      ? this[0]
      : this[idx + 1]
  }
}
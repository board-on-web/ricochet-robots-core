import { Color } from 'three'
import robotsDescription from '../assets/robots.json'
import { Robot } from '../models/robot'
import { RobotStateDto } from '../models/state'
import { loadStlModels } from '../utils/load-models'
import { IState } from '../types/state'

export class RobotsController extends Array<Robot> implements IState<Array<RobotStateDto>> {
  private _selectedRobot: Robot | null = null

  constructor(robots: typeof robotsDescription, models: Awaited<ReturnType<typeof loadStlModels>>) {
    const items = robots.map(it => {
      const robot = new Robot(models, new Color(it.color))
      robot.userData = {
        type: it.name,
        tint: it.tint
      }
      // by default hide robots
      robot.visible = false

      return robot
    })

    super(...items)
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

  public show() {
    this.forEach(it => {
      it.visible = true
    })
  }

  public hide() {
    this.forEach(it => {
      it.visible = false
    })
  }

  public restore(state: RobotStateDto[]): void {
    state.forEach(it => {
      const robot = this.find(robot => it.type === robot.userData.type)

      if (robot) {
        robot.visible = true
        robot.moveTo(it.position)
      }
    })
  }

  public get state(): RobotStateDto[] {
    return this.map(it => ({
      type: it.userData.type,
      position: it.coords
    }))
  }
}
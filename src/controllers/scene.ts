import { Color, Scene } from "three";

export class SceneController extends Scene {
  constructor() {
    super()

    this.changeBackground()
  }

  public changeBackground(color: Color = new Color('#D7CCC8')) {
    return
  }
}
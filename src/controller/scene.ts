import { Easing, Tween } from "@tweenjs/tween.js";
import { Color, Scene } from "three";

export class SceneController extends Scene {
  constructor() {
    super()

    this.changeBackground()
  }

  public changeBackground(color: Color = new Color('#D7CCC8')) {
    if (!this.background) {
      this.background = new Color('black')
    }

    new Tween(this.background)
      .to(color, 200)
      .easing(Easing.Linear.None)
      .start()
  }
}
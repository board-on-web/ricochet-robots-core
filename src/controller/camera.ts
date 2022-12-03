import { Easing, Tween } from "@tweenjs/tween.js";
import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class CameraController extends OrbitControls {
  private initialPosition = new Vector3(0, 2.4, 0)

  constructor(private readonly camera: PerspectiveCamera, element: HTMLCanvasElement) {
    super(camera, element)

    camera.position.set(
      this.initialPosition.x,
      this.initialPosition.y,
      this.initialPosition.z,
    )
    this.target = new Vector3(0, -0.3, 0)

    this.enablePan = false
    this.enableZoom = false
    this.maxAzimuthAngle = 0
    this.minAzimuthAngle = 0
    this.maxPolarAngle = 30 * (Math.PI / 180)
  }

  toInitialPosition() {
    new Tween(this.camera.position)
      .to(this.initialPosition, 300)
      .easing(Easing.Cubic.Out)
      .onUpdate(this.update)
      .start()
  }
}
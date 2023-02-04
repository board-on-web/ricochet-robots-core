import { Easing, Tween } from "@tweenjs/tween.js";
import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const CAMERA_INITIAL_POSITION = new Vector3(0, 2.6, 0)

export class CameraController extends OrbitControls {
  constructor(private readonly camera: PerspectiveCamera, element: HTMLCanvasElement) {
    super(camera, element)

    camera.position.set(
      CAMERA_INITIAL_POSITION.x,
      CAMERA_INITIAL_POSITION.y,
      CAMERA_INITIAL_POSITION.z,
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
      .to(CAMERA_INITIAL_POSITION, 300)
      .easing(Easing.Cubic.Out)
      .onUpdate(this.update)
      .start()
  }
}
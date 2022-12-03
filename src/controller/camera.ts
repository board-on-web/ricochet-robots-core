import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class CameraController extends OrbitControls {
  constructor(private readonly camera: PerspectiveCamera, element: HTMLCanvasElement) {
    super(camera, element)

    camera.position.y = 2.4
    this.target = new Vector3(0, -0.3, 0)
    
    this.enablePan = false
    this.enableZoom = false
    this.maxAzimuthAngle = 0
    this.minAzimuthAngle = 0
    this.maxPolarAngle = 30 * (Math.PI / 180)
  }
}
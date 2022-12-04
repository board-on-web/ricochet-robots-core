import { Camera, Intersection, Object3D, Raycaster, Vec2 } from "three";

export class RaycasterController extends Raycaster {
  public intersects(from: Object3D, camera: Camera, point: Vec2, canvas: HTMLCanvasElement): Array<Intersection<Object3D>> {
    const bbox = canvas.getBoundingClientRect()
    const pointer: Vec2 = {
      x: ((point.x - bbox.left) / canvas.scrollWidth) * 2 - 1,
      y: -((point.y - bbox.top) / canvas.scrollHeight) * 2 + 1
    }

    this.setFromCamera(pointer, camera)
    return this.intersectObjects(from.children)
  }
}
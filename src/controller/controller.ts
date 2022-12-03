import { Mesh } from "three";

export abstract class Controller {
  constructor(public readonly model: Mesh) {}
}
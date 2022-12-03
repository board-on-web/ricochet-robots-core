import { Group } from "three";

export abstract class Controller {
  constructor(public readonly model: Group) {}
}
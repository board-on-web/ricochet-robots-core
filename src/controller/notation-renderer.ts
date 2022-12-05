import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";

export class NotationsRenderer extends CSS2DRenderer {
  constructor(parameters?: ConstructorParameters<typeof CSS2DRenderer>[0]) {
    super(parameters)
    
    this.domElement.id = 'notation-container'
    this.domElement.style.position = 'absolute'
    this.domElement.style.top = '0px'
    this.domElement.style.pointerEvents = 'none'
  }
}
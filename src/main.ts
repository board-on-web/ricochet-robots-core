import { ViewController } from "./controllers/view";

new ViewController().make()
  .then(vc => {
    vc.startRendering()
  })

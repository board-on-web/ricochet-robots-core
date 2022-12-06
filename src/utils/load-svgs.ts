import { LoadingManager, Shape } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import models from '../assets/svgs.json'

export async function loadSvgs(loadingManager?: LoadingManager): Promise<Record<keyof typeof models, Array<Array<Shape>>>> {
  const svgLoader = new SVGLoader(loadingManager)
  const resourcesData = Object.entries(models).map(async it => ({
    name: it[0],
    model: await svgLoader.loadAsync(import.meta.env.VITE_APP_BASE_PATH + it[1]).then(it => it.paths.map(it => it.toShapes(true)))
  }))

  return await Promise.all(resourcesData).then(it => it.reduce((acc, it) => ({
    ...acc,
    [it.name]: it.model
  }), {} as Record<keyof typeof models, Array<Array<Shape>>>))
}
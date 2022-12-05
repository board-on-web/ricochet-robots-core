import { BufferGeometry, LoadingManager } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import models from '../assets/stls.json'

export async function loadStlModels(loadingManager?: LoadingManager): Promise<Record<keyof typeof models, BufferGeometry>> {
  const stlLoader = new STLLoader(loadingManager)
  const resourcesData = Object.entries(models).map(async it => ({
    name: it[0],
    model: await stlLoader.loadAsync(import.meta.env.VITE_APP_BASE_PATH + it[1])
  }))
  const resolvedResourcesData = await Promise.all(resourcesData)

  return resolvedResourcesData.reduce((acc, it) => ({
    ...acc,
    [it.name]: it.model
  }), {} as Record<keyof typeof models, BufferGeometry>)
}
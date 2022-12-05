import { LoadingManager, Texture, TextureLoader } from "three";
import textures from '../assets/textures.json'

export async function loadTextures(loadingManager?: LoadingManager): Promise<Record<keyof typeof textures, Texture>> {
  const textureLoader = new TextureLoader(loadingManager)
  const resourcesData = Object.entries(textures).map(async it => ({
    name: it[0],
    texture: await textureLoader.loadAsync(import.meta.env.VITE_APP_BASE_PATH + it[1])
  }))
  const resolvedResourcesData = await Promise.all(resourcesData)

  return resolvedResourcesData.reduce((acc, it) => ({
    ...acc,
    [it.name]: it.texture
  }), {} as Record<keyof typeof textures, Texture>)
}
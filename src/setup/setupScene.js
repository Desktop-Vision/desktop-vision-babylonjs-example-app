import * as BABYLON from 'babylonjs'
import { canvas } from './setupDocument'

function createDefaultEngine() {
    return new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    })
  }
  
  function createScene(engine) {
    const scene = new BABYLON.Scene(engine)
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
    )
    BABYLON
    return scene
  }
  
  function createCamera(scene) {
    const camera = new BABYLON.UniversalCamera(
      'camera',
      new BABYLON.Vector3(0, 0, 0),
    )
    camera.attachControl(canvas, true)
    return camera
  }
  
function createTestPlane(scene) {
    const testMat = new BABYLON.StandardMaterial('test-mat', scene)
    const color = new BABYLON.Color4(0, 0, 0, 1)
    testMat.diffuseColor = color
    testMat.specularColor = color
    testMat.emissiveColor = color
    testMat.ambientColor = color
    const testOptions = {
      height: 1,
      width: 2,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    }
  
    const testPlane = BABYLON.MeshBuilder.CreatePlane(
      'test-mesh',
      testOptions,
      scene,
    )
    testPlane.position.z = 2.25
  
    return testPlane
  }

  export {createDefaultEngine, createScene, createCamera, createTestPlane}
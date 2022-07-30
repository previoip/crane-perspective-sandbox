import * as THREE from 'three'
import { OrbitControls  } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js'
import { GUI  } from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/dat.gui.module'
import { Vec2, Vec3, Eul3 } from './src/vectorUtils.js';
import { Struct } from './src/structs.js'

// DOM 
const body = document.body;
const screen_width = window.innerWidth;
const screen_height = window.innerHeight;
const screen_aspect_ratio = screen_width/screen_height
const n_cam = 2;

// DOM-Panel/window elements
const sceneStatPanel = body.children.sceneStat;
const windowViewports = body.children.viewports;
const rendererOverall = appendRendererElNode(windowViewports, n_cam);
const rendererPerspective = appendRendererElNode(windowViewports, n_cam);
const renderers = [rendererOverall, rendererPerspective]
// wrappers, namepspaces
const degToRad = (x) => { return THREE.MathUtils.degToRad(x) }
class CameraWrapper {
  constructor(name, pos = new Vec3(0,0,10), rot = new Eul3(0,0,0), clip = new Vec2(0.1, 100)) {
    this.name = name
    this.pos = pos
    this.rot = rot
    this.clip = clip
    // set defaults
    this.fov = 75
    this.aspect_ratio = 1 
    this.o = new THREE.PerspectiveCamera(this.fov, this.aspect_ratio, this.clip.x, this.clip.y)
    this.h = new THREE.CameraHelper(this.o)
    this.updateTransformation()
  }

  updateTransformation() {
    this.o.position.set(this.pos.x, this.pos.y, this.pos.z)
    this.o.rotation.set(this.rot.x, this.rot.y, this.rot.z)
  }

  updateIntrinsic(){
    this.o.fov = this.fov
    this.o.aspect = this.aspect_ratio
    this.o.updateProjectionMatrix() 
  }
}

// THREE inits
const scene = new THREE.Scene();
const cameraOverall = new CameraWrapper('overall')
const cameraTest = new CameraWrapper('test')
const cameras = [cameraOverall, cameraTest]

cameras.forEach((e)=>{e.o.aspect = windowViewports.clientWidth/(windowViewports.clientHeight*n_cam); e.updateIntrinsic()})




// entrypoint
main()
mainloop()

function main() {
  {
    const control = new OrbitControls(cameraOverall, rendererOverall.domElement)
    control.update()
  }
  {
    const axesHelper = new THREE.AxesHelper(40);
    scene.add( axesHelper )
    scene.add( cameraTest.h )
  }
  {
    const basic_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const geom = new THREE.BoxGeometry(1,1,1);
    const cube = new THREE.Mesh( geom, basic_material );
    scene.add( cube )
  }
  {
    const light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 50, 50, 50 );
    scene.add( light );
  }
  
  const gui = new GUI();
  const cam1 = gui.addFolder('Overall View Camera Control')

}


function mainloop() {
  rendererOverall.render( scene, cameraOverall.o )
  rendererPerspective.render( scene, cameraTest.o )

  requestAnimationFrame( mainloop );
}


function appendRendererElNode(e, n=1) {
  const renderer = new THREE.WebGLRenderer();
  const w = e.clientWidth/n;
  const h = e.clientHeight;
  renderer.setSize(w, h)
  e.appendChild(renderer.domElement)
  return renderer
}


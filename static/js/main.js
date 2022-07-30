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

// DOM-Panel/window elements
const Panel = body.children.panel;
const ViewOverall = body.children.viewOverall;

// wrappers
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
    this.update()
  }

  update () {
    this.o.position.set(this.pos.x, this.pos.y, this.pos.z)
  }
}

// THREE inits
const scene = new THREE.Scene();
const ViewOveralRenderer = appendRendererElNode(ViewOverall);
const cameraOverall = new CameraWrapper('overall')

// entrypoint
main()
mainloop()

function main() {
  const axesHelper = new THREE.AxesHelper(40)
  
  const geom = new THREE.BoxGeometry(1,1,1);
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geom, material );
  scene.add( cameraOverall.h )
  scene.add( axesHelper )
  scene.add( cube )

  const gui = new GUI();
  const cam1 = gui.addFolder('Overall View Camera Control')

}

function mainloop() {
  ViewOveralRenderer.render( scene, cameraOverall.o )
  requestAnimationFrame( mainloop );
}


function appendRendererElNode(e) {
  const renderer = new THREE.WebGLRenderer();
  const w = e.clientWidth;
  const h = e.clientHeight;
  renderer.setSize(w, h)
  e.appendChild(renderer.domElement)
  return renderer
}


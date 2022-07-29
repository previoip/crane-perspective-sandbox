import * as THREE from 'three'
import { OrbitControls  } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js'
import { GUI  } from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/dat.gui.module'
import { Vec2, Vec3 } from './src/vectorUtils.js';
import { Struct } from './src/structs.js'

// DOM 
const body = document.body;
const screen_width = window.innerWidth;
const screen_height = window.innerHeight;
const aspect_ratio = screen_width/screen_height


// DOM-Panel/window elements
const Panel = body.children.panel;
const SceneStat = body.children.sceneStat;
const ViewOverall = body.viewOverall;
const ViewProjection = body.viewProjection;

// TRHEE inits, wrappers
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer(screen_width, screen_height);
const degToRad = (x) => { return THREE.MathUtils.degToRad(x) }

// Structs
const T_Camera = Struct('id', 'obj', 'fov', 'pos', 'ang', 'clip')
const T_Geom = Struct('id', 'obj', 'fov', 'pos', 'ang')

var cameraOverall = T_Camera('overall', null, 75, new Vec3(0,0,0), new Vec3(0,0,0), new Vec2(0, 10))
var cameraPerspective = T_Camera('perspective', null, 75, new Vec3(0,0,0), new Vec3(0,0,0), new Vec2(0, 10))
cameraOverall.obj = new THREE.PerspectiveCamera(cameraOverall.fov, aspect_ratio, cameraOverall.clip.a,cameraOverall.clip.b)
cameraPerspective.obj = new THREE.PerspectiveCamera(cameraPerspective.fov, aspect_ratio, cameraPerspective.clip.a,cameraPerspective.clip.b)
const cameras = [cameraOverall, cameraPerspective]



// entry
init()
anim()

function init() {

  const tes = new Vec3(1,1,1)
  console.log(tes.coords)
  tes.offset(1,2,3)
  console.log(tes.coords)
  tes.setPolar(20, degToRad(45), degToRad(45))
  console.log(tes.coords)
  console.log(tes.dist)
  // body.appendChild(renderer.domElement);
  // const geom = new THREE.BoxGeometry(1,1,1);
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const cube = new THREE.Mesh( geom, material );
}

function anim() {
  // renderer.render( scene, camera )
  // requestAnimationFrame( anim );
}
// entry ends





function createRendererInEl(elem) {
  const renderer = new THREE.WebGLRenderer();
  const w = elem.clientWidth;
  const h = elem.clientHeight;
  renderer.setSize(w, h)
  elem.appendChild(renderer.domElement)
  return renderer
}


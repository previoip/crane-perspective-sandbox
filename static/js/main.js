import * as THREE from 'three';

const body = document.body;

const screen_width = window.innerWidth;
const screen_height = window.innerHeight;
const aspect_r = screen_width/screen_height

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(10, aspect_r, 2, 10);
const renderer = new THREE.WebGLRenderer(screen_width, screen_height);

const Panel = body.children.panel;
const SceneStat = body.children.sceneStat;
const ViewOverall = body.viewOverall;
const ViewProjection = body.DviewProjection;


// entry
init()
anim()

function init() {

  const CameraPropSection = document.createElement('table')
  const input_fov = createInputSliderPanel('fov', 200, 0, 75  , 0.1, 'FOV')
  const input_cam_r = createInputSliderPanel('camera_dist_radius', 100, 0, 10, 0.1, 'camera R (m)')
  const input_cam_t = createInputSliderPanel('camera_theta', 180, -180, 0, 0.1, 'camera &theta; (deg)')
  const input_cam_g = createInputSliderPanel('camera_gamma', 90, -90, 0, 0.1, 'camera &gamma; (deg)')
  const CameraPropSection_items = [input_fov, input_cam_t, input_cam_g]
  const CameraPropSection_itemsFormOnly = [input_cam_r]
  const CameraPropSectionTitle = document.createElement('h5')
  CameraPropSectionTitle.innerHTML = 'Camera Props'

  CameraPropSection_items.forEach((e)=>{
    const tr = CameraPropSection.insertRow();
    [e.h, e.f, e.s].forEach((e)=>{
      const td = tr.insertCell();
      td.appendChild(e);
    })
  }) 

  CameraPropSection_itemsFormOnly.forEach((e)=>{
    const tr = CameraPropSection.insertRow();
    [e.h, e.f].forEach((e)=>{
      const td = tr.insertCell();
      td.appendChild(e);
    })
  }) 

  Panel.appendChild(CameraPropSectionTitle)
  Panel.appendChild(CameraPropSection)

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

function CameraProps(){
  //  Camere prop constructor
  this.o = null
  this.x = 0
  this.y = 0
  this.z = 0
  this.setPolarCoord = (theta, gamma, r) => {
      this.z = r * Math.sin(gamma);
      this.x = r * Math.sin(theta);
      this.y = r * Math.cos(theta);
  }
}

// structs, impls
// var CameraProps = {
//   'o': null,
//   'fov': 75,
//   'x': 0,
//   'y': 0,
//   'z': 0,
//   setPolarCoord(theta, gamma, r) {
//     this.z = r * Math.sin(gamma);
//     this.x = r * Math.sin(theta);
//     this.y = r * Math.cos(theta);
//   },
//   setCartesianCoord(x, y, z) {
//     this.x = x;
//     this.y = y;
//     this.z = z;
//   }
// }




function createInputEl(type, name, min=0, max=10, value=0) {
  // basic slider constructor function. returns slider element
  const elem = document.createElement('input');
  elem.id = name
  elem.type = type
  elem.min = min;
  elem.max = max;
  elem.value = value;
  return elem
}

function createInputSliderPanel(name, max, min, value, step, text = '') {
  const h = document.createElement('h6')
  const f = createInputEl('number', 'f_'+name, min, max, value)
  const s = createInputEl('range', 's_'+name, min, max, value)
  s.step = step
  f.size = 3
  f.addEventListener('input', ()=>{s.value = f.value})
  s.addEventListener('input', ()=>{f.value = s.value})
  h.innerHTML = text
  return {h, f, s}
}

function createRendererInEl(elem) {
  const renderer = new THREE.WebGLRenderer();
  const w = elem.clientWidth;
  const h = elem.clientHeight;
  renderer.setSize(w, h)
  elem.appendChild(renderer.domElement)
  return renderer
}
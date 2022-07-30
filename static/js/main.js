import * as THREE from 'three'
import { OrbitControls  } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js'
import { GUI  } from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/dat.gui.module'
import Stats from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/stats.module'
import { Struct } from './src/structs.js';
// import { Vec2, Vec3, Eul3 } from './src/vectorUtils.js';

const propertyPointer = Struct('value')

// entrypoint
function main() {
  // DOM 
  const body = document.body;
  const canvas = body.children.canvas;
  const windowViewports = body.children.viewports;
  const windowViewportOverall = windowViewports.children.overall;
  const windowViewportProjection = windowViewports.children.projection;
  const screen_width = window.innerWidth;
  const screen_height = window.innerHeight;
  const screen_aspect_ratio = screen_width/screen_height

  // THREE inits
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas });
  const cameraOverall = new THREE.PerspectiveCamera( 50, screen_aspect_ratio, 0.1, 100 )
  const cameraOverallHelper = new THREE.CameraHelper(cameraOverall)
  const cameraPerspective = new THREE.PerspectiveCamera( 10, screen_aspect_ratio, 0.1, 40 )
  const cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective )
  const stats = Stats()

  //random setups
  {
    cameraOverall.position.set( 0, 10, 30 );
    cameraPerspective.position.set( 20, 20, 20 );
    scene.background = new THREE.Color( 'black' )
    // scene.add( cameraOverallHelper )
    scene.add( cameraPerspectiveHelper )
    document.body.appendChild( stats.dom )
  }

  // wrappers, namepspaces, misc: gui helper
  const degToRad = (x) => { return THREE.MathUtils.degToRad(x) }
  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max( this.obj[this.maxProp], v + this.minDif );
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min;
    }
  }

  // === setups

  // objects, geoms, meshes
  {
    const basic_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const geom = new THREE.BoxGeometry(1,1,1);
    const cube = new THREE.Mesh( geom, basic_material );
    scene.add( cube )
  }
  {
    const planeSize = 30;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      // wireframe: true
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 20);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  // controls, helper
  {
    const controls = new OrbitControls(cameraOverall, windowViewportOverall);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true
    controls.dampingFactor = .1
    controls.update();
  }
  {
    const controls = new OrbitControls(cameraPerspective, windowViewportProjection);
    controls.target.set(0, 0, 0);
    controls.enabled = false;
    controls.update();
  }
  {
    const axesHelper = new THREE.AxesHelper(40);
    scene.add( axesHelper )
  }
  {
    const gui = new GUI();
    const cameraPerspective_gui_controls = {
      get posz() {return cameraPerspective.position.y},
      set posz(v) {cameraPerspective.position.y = v; this.update()},

      update() {
        cameraPerspective.updateProjectionMatrix()
      }
    }
    const gui_cam = gui.addFolder( 'Camera Control' )
    gui_cam.add(cameraPerspective, 'fov', 1, 40, 0.01)
    gui_cam.add(cameraPerspective_gui_controls, 'posz', 1, 40, 0.01)
  }


  // mainloop
  function mainloop() {
    resizeRendererToDisplaySize( renderer )
    renderer.setScissorTest(true);
    {
      // overall camera setup
      const aspect = setScissorForElement( windowViewportOverall )
      cameraOverall.aspect = aspect
      cameraOverall.updateProjectionMatrix()
      renderer.render( scene, cameraOverall )
    }
    {
      // perspective camera setup
      const aspect = setScissorForElement( windowViewportProjection )
      cameraPerspective.aspect = aspect
      cameraPerspective.updateProjectionMatrix()
      renderer.render( scene, cameraPerspective )
    }
    stats.update()
    requestAnimationFrame( mainloop );
  }
  
  
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  
  function setScissorForElement(elem) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();
  
    const right = Math.min( elemRect.right, canvasRect.right ) - canvasRect.left;
    const left = Math.max( 0, elemRect.left - canvasRect.left );
    const bottom = Math.min( elemRect.bottom, canvasRect.bottom ) - canvasRect.top;
    const top = Math.max( 0, elemRect.top - canvasRect.top );
  
    const width = Math.min( canvasRect.width, right - left );
    const height = Math.min( canvasRect.height, bottom - top );
  
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor( left, positiveYUpBottom, width, height );
    renderer.setViewport( left, positiveYUpBottom, width, height );
  
    return width / height;
  }
  console.log('if you see this: everything runs just fine')
  mainloop()
}
main()
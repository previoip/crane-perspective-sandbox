import * as THREE from 'three'
import { OrbitControls  } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js'
import { GUI  } from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/dat.gui.module'
import Stats from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/stats.module'
// import { Struct } from './src/structs.js';
// import { Vec2, Vec3, Eul3 } from './src/vectorUtils.js';

// options
const opt = {
  camPersp: {fov: 20, x: 20, y: 10, z: 20},
  camOvral: {fov: 40, x: 20, y: 10, z: -20},
  targHlpr: {x: 0, y: 0, z: 0}
}

// deep copy of opt, used for prop resets control in gui
const ropt = JSON.parse(JSON.stringify(opt));

// => coldload options


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
  const cameraOverall = new THREE.PerspectiveCamera( opt.camOvral.fov, screen_aspect_ratio, 0.1, 100 )
  const cameraPerspective = new THREE.PerspectiveCamera( opt.camPersp.fov, screen_aspect_ratio, 0.1, 100 )
  const cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective )
  const polarHelper = new THREE.PolarGridHelper( 20, 16, 10, 32, 'green', 'limegreen' )
  const targetHelper = new THREE.ArrowHelper( new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2, 0xffffff )
  const stats = Stats()



  //random setups
  {
    cameraOverall.position.set( opt.camOvral.x, opt.camOvral.y, opt.camOvral.z );
    cameraPerspective.position.set( opt.camPersp.x, opt.camPersp.y, opt.camPersp.z );
    cameraPerspective.lookAt( targetHelper.position.x, targetHelper.position.y, targetHelper.position.z )
    // cameraPerspective.scale.set(new THREE.Vector3(.5,.5,.5))
    scene.background = new THREE.Color( '#0f0f50' );
    // scene.add( cameraOverallHelper );
    polarHelper.position.set(0,.05,0)
    scene.add( polarHelper );
    scene.add( targetHelper );
    scene.add( cameraPerspectiveHelper );
    document.body.appendChild( stats.dom );
  }

  // wrappers, namepspaces
  const degToRad = (x) => { return THREE.MathUtils.degToRad(x) }


  // === setups

  // objects, geoms, meshes
  {
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const geom = new THREE.BoxGeometry(1,1,1);
    const cube = new THREE.Mesh( geom, material );
    scene.add( cube )
  }
  {
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const geom = new THREE.BoxGeometry(1,1,1);
    const targetHelper = new THREE.Mesh( geom, material );
    scene.add( targetHelper )
  }

  {
    const planeSize = 50;
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
    const axesHelper = new THREE.AxesHelper(40);
    scene.add( axesHelper )
  }
  // gui
  {
    const gui = new GUI();
    const update = () => {
        const dist = Math.sqrt(
          (cameraPerspective.position.x - targetHelper.position.x)**2 +
          (cameraPerspective.position.y - targetHelper.position.y)**2 +
          (cameraPerspective.position.z - targetHelper.position.z)**2)
        cameraPerspective.near = Math.max(dist - 20, 0.1)
        cameraPerspective.far  = Math.max(dist + 40, 1)
        cameraPerspective.lookAt(targetHelper.position.x, targetHelper.position.y, targetHelper.position.z);
        cameraPerspective.updateProjectionMatrix()
    }
    // object wrappers
    const cameraPerspective_gui_controls = {
      get posx() {return cameraPerspective.position.x},
      set posx(v) {
        cameraPerspective.position.x = v; 
        update()
      },
      get posy() {return cameraPerspective.position.y},
      set posy(v) {
        cameraPerspective.position.y = v; 
        update()
      },
      get posz() {return cameraPerspective.position.z},
      set posz(v) {
        cameraPerspective.position.z = v; 
        update()
      },
      reset: () => {
        cameraPerspective.position.x = ropt.camPersp.x;
        cameraPerspective.position.y = ropt.camPersp.y;
        cameraPerspective.position.z = ropt.camPersp.z;
        cameraPerspective.fov = ropt.camPersp.fov;
        update()
      }
    }

    const target_gui_controls = {
      get posx() {return targetHelper.position.x},
      set posx(v) {
        targetHelper.position.x = v; 
        update()
      },
      get posy() {return targetHelper.position.y},
      set posy(v) {
        targetHelper.position.y = v; 
        update()
      },
      get posz() {return targetHelper.position.z},
      set posz(v) {
        targetHelper.position.z = v; 
        update()
      },
      reset: () => {
        targetHelper.position.x = ropt.targHlpr.x;
        targetHelper.position.y = ropt.targHlpr.y;
        targetHelper.position.z = ropt.targHlpr.z;
        update()
      }
    }
    // gui inst
    const gui_cam = gui.addFolder( 'Camera Control' )
    gui_cam.add(cameraPerspective, 'fov', 1, 40, 0.01).listen()
    gui_cam.add(cameraPerspective_gui_controls, 'posx', -40, 40, 0.01).name('x (m)').listen()
    gui_cam.add(cameraPerspective_gui_controls, 'posy', 0, 20, 0.01).name('y (m)').listen()
    gui_cam.add(cameraPerspective_gui_controls, 'posz', -40, 40, 0.01).name('z (m)').listen()
    gui_cam.add(cameraPerspective_gui_controls, 'reset')
    gui_cam.open()

    const gui_target = gui.addFolder( 'Target Control' )
    gui_target.add(target_gui_controls, 'posx', -10, 10, 0.01).name('x (m)').listen()
    gui_target.add(target_gui_controls, 'posy',  0,  10, 0.01).name('y (m)').listen()
    gui_target.add(target_gui_controls, 'posz', -10, 10, 0.01).name('z (m)').listen()
    gui_target.add(target_gui_controls, 'reset')
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
  window.addEventListener("beforeunload", function(e){
    // save opt
  }, false)
  console.log('if you see this: everything runs just fine')
  mainloop()
}
main()
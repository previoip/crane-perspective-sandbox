import * as THREE from 'three'
import { OrbitControls  } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/dat.gui.module'
import Stats from 'https://unpkg.com/three@0.132.2/examples/jsm/libs/stats.module'
import { Panel } from './src/panel.js';
import { loadGLTF } from './src/GLTFLoader.js';
// import { Vec2, Vec3, Eul3 } from './src/vectorUtils.js';

let opt = { // options
  camPersp: {fov: 20, x: 20, y: 10, z: 20},
  camOvral: {fov: 40, x: -20, y: 10, z: 20},
  targHlpr: {x: 0, y: 0, z: 0}
}

// deep copy of opt, used for prop resets control in gui
const ropt = JSON.parse(JSON.stringify(opt));

// coldload options from localStorage
const localStorageName = 'craneSandbox'
const cached = localStorage.getItem(localStorageName)
if (cached) {
  opt = JSON.parse(cached)
}

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
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  const cameraOverall = new THREE.PerspectiveCamera( opt.camOvral.fov, screen_aspect_ratio, 1, 300 )
  const cameraPerspective = new THREE.PerspectiveCamera( opt.camPersp.fov, screen_aspect_ratio, 1, 100 )
  const cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective )
  const axesHelper = new THREE.AxesHelper(40);
  const polarHelper = new THREE.PolarGridHelper( 20, 16, 20, 64, 0x44dd44, 0x55bb55 )
  const targetHelper = new THREE.AxesHelper(2)
  const cameraPerspectivePositionHelper = new THREE.ArrowHelper( new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 1), 20, 0xff00ff )
  const stats = Stats()
  const controlerOrbit = new OrbitControls(cameraOverall, windowViewportOverall);
  var CraneBBoxPrimitives = []

  // GUIs
  const gui = new GUI({ width: 200 });
  const guiFolder_ProjectionCam  = gui.addFolder( 'Camera Control' )
  const guiFolder_TargetOffset   = gui.addFolder( 'Camera Target Offset Control' )
  const guiFolder_PreviewCamera  = gui.addFolder( 'Preview Window Control' )
  const guiFolder_Overlays       = gui.addFolder( 'Overlay Visibility' )
  const guiFolder_CraneControl   = gui.addFolder( 'Crane Control' )

  { //random setups
    cameraOverall.position.set( opt.camOvral.x, opt.camOvral.y, opt.camOvral.z );
    cameraPerspective.position.set( opt.camPersp.x, opt.camPersp.y, opt.camPersp.z );
    cameraPerspective.lookAt( targetHelper.position.x, targetHelper.position.y, targetHelper.position.z)
    renderer.setPixelRatio( window.devicePixelRatio );
    // cameraPerspectiveHelper.frustumCulled = false
    // console.log(cameraPerspectiveHelper)
    polarHelper.position.set(0, .03, 0);
    axesHelper.position.set(0, .05, 0);
    scene.add( cameraPerspectiveHelper );
    scene.add( axesHelper );
    scene.add( polarHelper );
    scene.add( targetHelper );
    scene.add( cameraPerspectivePositionHelper );
    scene.background = new THREE.Color( '#0f0f50' );
    // document.body.appendChild( stats.dom );
    updateCameraPerspectivePositionHelper();
  }

  // loads Crane 3D Object
  const target_model = ['static/blob/crane_full.glb', 'CraneFull']
  loadGLTF(target_model[0]).then((res) => {
    res.scene.name = target_model[1]
    scene.add(res.scene);
    const craneTrailer = res.scene.getObjectByName('mesh_Trail');
    const craneBox = craneTrailer.getObjectByName('mesh_Box');
    const craneBoom = craneTrailer.getObjectByName('mesh_BoomPivot').getObjectByName('mesh_BoomMast')
    const CraneBBOX = getChild3DObjectsByPrefix(craneTrailer, 'bbox');
    CraneBBOX.forEach(e => {
      e.material.transparent = true;
      e.material.opacity = .2;
      const [mid, dim] = get3DBBoxDimension( e )
      const boundingBox2D = construct2DBoundingBox(Math.max(dim.max.x - dim.min.x, dim.max.z - dim.min.z), dim.max.y - dim.min.y, '2Dbbox_' + e.name)
      var boundingBox2DworldPos = new THREE.Vector3()
      e.getWorldPosition( boundingBox2DworldPos )
      boundingBox2D.position.set(mid.x, mid.y, mid.z)
      boundingBox2D.lookAt( cameraPerspective.position )
      e.add(boundingBox2D)
      }
    )
    const crane_gui_controls = {
      get track_ang() {return radToDeg(craneTrailer.rotation.y)},
      set track_ang(v) {craneTrailer.rotation.set(craneTrailer.rotation.x, degToRad(v), craneTrailer.rotation.z)},
      get box_ang() {return radToDeg(craneBox.rotation.y)},
      set box_ang(v) {craneBox.rotation.set(craneBox.rotation.x, degToRad(v), craneBox.rotation.z)},
      get boom_ang() {return radToDeg(craneBoom.rotation.x)},
      set boom_ang(v) {craneBoom.rotation.set(degToRad(v), craneBoom.rotation.y, craneBoom.rotation.z)},
      reset() {craneTrailer.rotation.set(0,0,0); craneBox.rotation.set(0,0,0); craneBoom.rotation.set(0,0,0)}
    }
    guiFolder_CraneControl.add(crane_gui_controls, 'track_ang', -180, 180, 0.01).name('Tire Rot').listen()
    guiFolder_CraneControl.add(crane_gui_controls, 'box_ang', -180, 180).name('Box Rot').listen()
    // guiF.add(crane_gui_controls, 'boom_ang', -30, 60, 0.01).name('Box Rot').listen()
    guiFolder_CraneControl.add(crane_gui_controls, 'reset')
  })


  // === objects, geoms, meshes setups
  {
    const planeSize = 50;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('static/textures/checker_darker.png');
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

    const gui_control = {a: true}
    guiFolder_Overlays.add(gui_control, 'a')
    .onChange(()=>{mesh.visible = gui_control.a})
    .name('Ground');
  }
  {
    const color = 0xFFFFFF;
    const light = new THREE.DirectionalLight(color, .8);
    const light2 = new THREE.DirectionalLight(color, .8);
    light.position.set(20, 30, 20);
    light.target.position.set(-5, 0, 0);
    light2.position.set(-20, 50, -20);
    light2.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);
    scene.add(light2);
    scene.add(light2.target);
  }
  { // orbit controls
    controlerOrbit.target.set(0, 0, 0);
    controlerOrbit.enableDamping = true
    controlerOrbit.dampingFactor = .1
    controlerOrbit.update();
  }

  { // predefined GUI inst
    const update = () => {
        const dist = Math.sqrt(
          (cameraPerspective.position.x - targetHelper.position.x)**2 +
          (cameraPerspective.position.y - targetHelper.position.y)**2 +
          (cameraPerspective.position.z - targetHelper.position.z)**2)
        // cameraPerspective.near = Math.max(dist - 50, 0.1)
        cameraPerspective.far  = Math.max(dist + 50, 1)
        cameraPerspective.lookAt(targetHelper.position.x, targetHelper.position.y, targetHelper.position.z);
        cameraPerspective.updateProjectionMatrix()
        updateCameraPerspectivePositionHelper()
        cameraPerspectiveHelper.update()
      }

    { // gui - camera control scope
      const cameraPerspective_gui_controls = {
        get fov() {return cameraPerspective.fov},
        set fov(v) {
          cameraPerspective.fov = v; 
          cameraPerspectiveHelper.update();
        },
        get Cx() {return cameraPerspective.position.x},
        set Cx(v) {
          cameraPerspective.position.x = v; 
          update()
        },
        get Cy() {return cameraPerspective.position.y},
        set Cy(v) {
          cameraPerspective.position.y = v; 
          update()
        },
        get Cz() {return cameraPerspective.position.z},
        set Cz(v) {
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
      guiFolder_ProjectionCam.add(cameraPerspective_gui_controls, 'fov',  1,  120, 0.01).listen()
      guiFolder_ProjectionCam.add(cameraPerspective_gui_controls, 'Cx', -40, 40, 0.01).name('x (m)').listen()
      guiFolder_ProjectionCam.add(cameraPerspective_gui_controls, 'Cy', 0,   20, 0.01).name('y (m)').listen()
      guiFolder_ProjectionCam.add(cameraPerspective_gui_controls, 'Cz', -40, 40, 0.01).name('z (m)').listen()
      guiFolder_ProjectionCam.add(cameraPerspective_gui_controls, 'reset')
    }

    { // gui - camera offset scope
      const target_gui_controls = {
        get Cx() {return targetHelper.position.x},
        set Cx(v) {
          targetHelper.position.x = v; 
          update()
        },
        get Cy() {return targetHelper.position.y},
        set Cy(v) {
          targetHelper.position.y = v; 
          update()
        },
        get Cz() {return targetHelper.position.z},
        set Cz(v) {
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
      guiFolder_TargetOffset.add(target_gui_controls, 'Cx', -10, 10, 0.01).name('x (m)').listen()
      guiFolder_TargetOffset.add(target_gui_controls, 'Cy',  0,  10, 0.01).name('y (m)').listen()
      guiFolder_TargetOffset.add(target_gui_controls, 'Cz', -10, 10, 0.01).name('z (m)').listen()
      guiFolder_TargetOffset.add(target_gui_controls, 'reset')  
    }

    { // gui - camera preview scope
      const cameraOverall_gui_controls = {
        reset: () => {
          cameraOverall.position.x = ropt.camOvral.x;
          cameraOverall.position.y = ropt.camOvral.y;
          cameraOverall.position.z = ropt.camOvral.z;
          cameraOverall.fov = ropt.camOvral.fov;
          cameraOverall.lookAt(0, 0, 0);
          cameraOverall.updateProjectionMatrix()
          controlerOrbit.target.set(0, 0, 0)
          controlerOrbit.update()
        }
      }
      guiFolder_PreviewCamera.add(cameraOverall_gui_controls, 'reset')  
    }

    { // gui - helpers visibility
      const helper_gui_controls = {
        polarHelper: true,
        axesHelper: true,
        targetHelper: true,
        cameraHelper: true,
        cameraPositionHelper: true,
        checkerboardPlane: true,
      }
      guiFolder_Overlays.add(helper_gui_controls, 'axesHelper')
        .onChange(()=>{axesHelper.visible = helper_gui_controls.axesHelper})
        .name('origin axis');
      guiFolder_Overlays.add(helper_gui_controls, 'polarHelper')
        .onChange(()=>{polarHelper.visible = helper_gui_controls.polarHelper})
        .name('polar coord overlay');
      guiFolder_Overlays.add(helper_gui_controls, 'targetHelper')
        .onChange(()=>{targetHelper.visible = helper_gui_controls.targetHelper})
        .name('target pointer');
      guiFolder_Overlays.add(helper_gui_controls, 'cameraHelper')
        .onChange(()=>{cameraPerspectiveHelper.visible = helper_gui_controls.cameraHelper})
        .name('camera outline');
      guiFolder_Overlays.add(helper_gui_controls, 'cameraPositionHelper')
        .onChange(()=>{cameraPerspectivePositionHelper.visible = helper_gui_controls.cameraPositionHelper})
        .name('camera height indicator');
    }
  }

  // panel inst
  const sceneStatsPanel = new Panel('Scene Stats', body)  
  const sceneStatsPanelFields = {
    'viewportWindowWidth (px)': [windowViewportProjection, 'clientWidth'],
    'viewportWindowHeight (px)': [windowViewportProjection, 'clientHeight'],
    'Camera FOV': [cameraPerspective, 'fov'],
    'Camera coord X (m)': [cameraPerspective.position, 'x'],
    'Camera coord Z (m)': [cameraPerspective.position, 'z'],
    'Camera height (m)': [cameraPerspective.position, 'y'],
  }
  {
    Object.entries(sceneStatsPanelFields).forEach( e => {
      const [k, _] = e
      sceneStatsPanel.addField(k, '')
    })
  }

  // mainloop
  var counter = 0;
  const counterLimit = 30;
  function mainloop() {
    resizeRendererToDisplaySize( renderer )
    renderer.setScissorTest(true);
    { // overall camera setup
      const aspect = setScissorForElement( windowViewportOverall )
      cameraOverall.aspect = aspect
      cameraOverall.updateProjectionMatrix()
      renderer.render( scene, cameraOverall )
    }
    { // perspective camera setup
      const aspect = setScissorForElement( windowViewportProjection )
      cameraPerspective.aspect = aspect
      cameraPerspective.updateProjectionMatrix()
      renderer.render( scene, cameraPerspective )
    }
    stats.update()

    counter++;
    // processes that updates per counterLimit framecycles
    if (counter%counterLimit == 0) {
      counter = 0
      {
        CraneBBoxPrimitives.forEach( e => {
          // todo
        } )
      }
      { // updates sceneStat panel
        Object.entries(sceneStatsPanelFields).forEach( e => {
          const [k, v] = e
          sceneStatsPanel.updateField(k, v[0][v[1]])
        })
      }
    }
    requestAnimationFrame( mainloop );
  }

  // misc functions which will be hoisted later
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      cameraPerspectiveHelper.update()
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

  function updateCameraPerspectivePositionHelper() {
    cameraPerspectivePositionHelper.position.set(
      cameraPerspective.position.x, 
      0, 
      cameraPerspective.position.z
    )
    cameraPerspectivePositionHelper.setLength( cameraPerspective.position.y )
  }

  function degToRad(x) { return THREE.MathUtils.degToRad(x) }

  function radToDeg(x) { return THREE.MathUtils.radToDeg(x) }

  function getChild3DObjectsByPrefix( obj, prefix ) {
    // recursively get child of nodes if has prefix
    var li = [];
    obj.children.forEach( e => { 
      if (e.name.startsWith(prefix)) {
        li.push(e)
      }
      else {
        getChild3DObjectsByPrefix(e, prefix).forEach( f => {
          li.push(f)
        })
      }
     })
     return li
  }

  function construct2DBoundingBox(dx, dy, name="", color = 0x00ffff) {
    // pseudo bounding box
    var points = []
    points.push( new THREE.Vector3(-dx/2, -dy/2,  0));
    points.push( new THREE.Vector3(-dx/2,  dy/2,  0));
    points.push( new THREE.Vector3( dx/2,  dy/2,  0));
    points.push( new THREE.Vector3( dx/2, -dy/2,  0));
    points.push( new THREE.Vector3(-dx/2, -dy/2,  0));
    const geom = new THREE.BufferGeometry().setFromPoints( points );
    const mat = new THREE.LineBasicMaterial( { color: color } );
    mat.transparent = true;
    mat.opacity = .6
    const line = new THREE.Line( geom, mat );
    line.name = name
    return line
  }

  function get3DBBoxDimension(obj3D) {
    const center = new THREE.Vector3();
    const geom = obj3D.geometry;
    // geom.computeBoundingBox();
    const BBoxSize = {
      max: new THREE.Vector3(
        geom.boundingBox.max.x,
        geom.boundingBox.max.y,
        geom.boundingBox.max.z
      ),
      min: new THREE.Vector3(
        geom.boundingBox.min.x,
        geom.boundingBox.min.y,
        geom.boundingBox.min.z
      ),
    }
    obj3D.localToWorld( center );
    center.x = (BBoxSize.max.x + BBoxSize.min.x) / 2;
    center.y = (BBoxSize.max.y + BBoxSize.min.y) / 2;
    center.z = (BBoxSize.max.z + BBoxSize.min.z) / 2;
    return [center, BBoxSize];
}

  // handler upon app exits/reload
  window.addEventListener("beforeunload", ()=>{
    // save opt
    opt = {
      camPersp: {
        fov: cameraPerspective.fov,
        x: cameraPerspective.position.x,
        y: cameraPerspective.position.y,
        z: cameraPerspective.position.z
      },
      camOvral: {
        fov: cameraOverall.fov,
        x: cameraOverall.position.x,
        y: cameraOverall.position.y,
        z: cameraOverall.position.z
      },
      targHlpr: {
        x: targetHelper.position.x, 
        y: targetHelper.position.y, 
        z: targetHelper.position.z
      }
    };
    localStorage.setItem(localStorageName, JSON.stringify(opt))
  }, false)

  mainloop()
}
main()
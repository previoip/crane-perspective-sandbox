import { GLTFLoader } from 'https://unpkg.com/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

function loadGLTF(path) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load( path, 
      ( gltf ) => {
        resolve( gltf )
      }, 
      ( xhr ) => {
        console.log( 'Loading '+ path + ' ' + (xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded' )
      }, 
      ( e ) => {
        console.error(e);
        reject( e )
      });
  })
}

export { loadGLTF }
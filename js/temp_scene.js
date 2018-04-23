const container = document.createElement('div');
document.body.appendChild( container );

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE_BACKGROUND);
// scene.fog = new THREE.Fog(scene.background, DEFAULT_NEAR, DEFAULT_FAR);

// Camera
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth/window.innerHeight, DEFAULT_NEAR, 1000);
camera.position.z = 25;

// Camera Controls
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
controls.domElement = container;
toggleControls(controls, true);
const initialSphereCenter = new THREE.Vector3().addVectors(
  camera.position, new THREE.Vector3(1000, 1000, 1000))
  //initialize far from camera to spawn on start
let timer;

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const shortList = ['', 'hi', 'bye'];
const textList = ['', 'hi', 'bye', 'poop', 'happy', 'excited', 'genki', 'desu', 'deyasu',
  'glasses', 'nose', 'computer', 'breadth-first search tree', 'keyboard', 'please',
  'pls', 'plz', 'plsplspls', 'work pls', '', '', '','', 'hi', 'bye', 'poop', 'happy', 'excited', 'genki', 'desu', 'deyasu',
    'glasses', 'nose', 'computer', 'breadth-first search tree', 'keyboard', 'please',
    'pls', 'plz', 'plsplspls', 'work pls', '', '', '','', 'hi', 'bye', 'poop', 'happy', 'excited', 'genki', 'desu', 'deyasu',
      'glasses', 'nose', 'computer', 'breadth-first search tree', 'keyboard', 'please',
      'pls', 'plz', 'plsplspls', 'work pls', '', '', '','', 'hi', 'bye', 'poop', 'happy', 'excited', 'genki', 'desu', 'deyasu',
        'glasses', 'nose', 'computer', 'breadth-first search tree', 'keyboard', 'please',
        'pls', 'plz', 'plsplspls', 'work pls', '', '', '','', 'hi', 'bye', 'poop', 'happy', 'excited', 'genki', 'desu', 'deyasu',
          'glasses', 'nose', 'computer', 'breadth-first search tree', 'keyboard', 'please',
          'pls', 'plz', 'plsplspls', 'work pls', '', '', '','', 'hi', 'bye', 'poop', 'happy', 'excited', 'genki', 'desu', 'deyasu',
            'glasses', 'nose', 'computer', 'breadth-first search tree', 'keyboard', 'please',
            'pls', 'plz', 'plsplspls', 'work pls', '', '', '','', 'hi', 'bye', 'poop', 'happy', 'excited', 'genki', 'desu', 'deyasu',
              'glasses', 'nose', 'computer', 'breadth-first search tree', 'keyboard', 'please',
              'pls', 'plz', 'plsplspls', 'work pls', '', '', ''];
const constellation = new Constellation(textList, data.mamuka[0], scene);

// Raycaster
// const raycaster = new THREE.Raycaster();
// raycaster.near = DEFAULT_NEAR;
// raycaster.far = 50;
// const mouse = new THREE.Vector2();

// const loadSphere = new SphericalLoading(
//   scene, SPAWN_RADIUS, VIEW_RADIUS, initialSphereCenter, SPRITE_SPAWN_PER_LOAD
// );

// Animate and Render
function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  controls.update(clock.getDelta());
  // raycaster.setFromCamera(mouse, camera);
  // const intersects = raycaster.intersectObjects(scene.children);
  // loadSphere.checkSpawn(camera.position);

  // if (intersected && intersected != intersects[0]) {
  //   intersected.object.material.color.set(0xffffff);
  // }
  // $('html,body').css('cursor', intersects[0] ? 'pointer' : 'default');
  // intersects[0] && intersects[0].object.material.color.set(0xe57373);
  // intersected = intersects[0];

  TWEEN.update();
  renderer.render(scene, camera);
}

// setListeners();
animate();

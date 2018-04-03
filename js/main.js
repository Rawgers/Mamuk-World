const container = document.createElement( 'div' );
document.body.appendChild( container );

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181817);
scene.fog = new THREE.Fog(scene.background, 3, 50);
const regions = [];

// Camera and camera controls
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 3, 50);
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
controls.domElement = container;
controls.movementSpeed = DEFAULT_MOVEMENT_SPEED;
controls.rollSpeed = DEFAULT_ROLL_SPEED;
let camRegion = new THREE.Vector3();
let timer;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Raycaster
const raycaster = new THREE.Raycaster();
raycaster.near = DEFAULT_NEAR;
raycaster.far = DEFAULT_FAR;
const mouse = new THREE.Vector2();

// Animate and Render
function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  controls.update(clock.getDelta());

  if (!isInFocus) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersected && intersected != intersects[0]) {
      intersected.object.material.color.set(0xffffff);
      $('html,body').css('cursor', 'pointer');
    }else{
      $('html,body').css('cursor', 'default');
    }
    intersected = intersects[0];
    intersected && intersected.object.material.color.set(0xe57373);
  }
  TWEEN.update();
  renderer.render(scene, camera);
}

createSprites(scene, camera.position, VIEW_RADIUS, SPRITE_SPAWN_COUNT);
setListeners();
animate();

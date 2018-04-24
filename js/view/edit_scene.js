// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE_BACKGROUND);

// Camera
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth/window.innerHeight, DEFAULT_NEAR, 1000);
camera.position.z = 30;

// Camera Controls
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
toggleControls(controls, true);
let timer;

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Constellation
const constellation = new Constellation(scene, data.mamuka[0], 'like');

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
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersected && intersected != intersects[0]) {
    intersected.object.material.color.set(0xffffff);
  }
  $('html,body').css('cursor', intersects[0] ? 'pointer' : 'default');
  intersects[0] && intersects[0].object.material.color.set(0xe57373);
  intersected = intersects[0];

  TWEEN.update();
  renderer.render(scene, camera);
}

setListeners();
animate();

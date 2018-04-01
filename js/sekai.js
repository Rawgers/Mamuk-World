// CONSTANTS
const SPRITE_MAX_DIM = 4;
const MAX_SPRITE_WINDOW_RATIO = 0.7;
const REGION_SIZE = 50;

const container = document.createElement( 'div' );
document.body.appendChild( container );

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181817);
scene.fog = new THREE.Fog(scene.background, 3, 50);
const regions = [];

// Camera and camera controls
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 3, 1000);
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
controls.domElement = container;
controls.movementSpeed = 30;
controls.rollSpeed = Math.PI / 6;
let camRegion = new THREE.Vector3();
let timer;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Raycaster
const raycaster = new THREE.Raycaster();
raycaster.far = 45;
let intersected; //to be used in render
const mouse = new THREE.Vector2();
let isInFocus = false;
let camOriginalPosition;
let camOriginalRotation;
let ongoingTween = [];
window.addEventListener('mousemove', (event) => {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

renderer.domElement.addEventListener('mousedown', event => {
  if (isInFocus){ //user desires to leave focus
    zoom(camOriginalPosition);
    controls.rollSpeed = Math.PI/6;
    controls.movementSpeed = 30;
    intersected.object.material.fog = true;
    intersected.object.material.opacity = 0.5;
    isInFocus = false;
  }else if (intersected){ //user desires to focus on one sprite
    controls.rollSpeed = 0;
    controls.movementSpeed = 0;
    intersected.object.material.color.set(0xffffff);
    intersected.object.material.fog = false;
    intersected.object.material.opacity = 1;
    camOriginalPosition = camera.position.clone();
    camOriginalRotation = camera.quaternion.clone();
    zoom(intersected.object.position);
    isInFocus = true;
  }
});

const zoom = (tarPos) => {
  // allow camera to view close object
  camera.near = isInFocus ? 3 : calcViewScalar(intersected.object) * 0.8;
  camera.updateProjectionMatrix();

  // Position animation setup
  const distVec = new THREE.Vector3()
    .subVectors(tarPos, camera.position);
  const viewPos = isInFocus
    ? new THREE.Vector3()
    : distVec.clone().normalize().multiplyScalar(calcViewScalar(intersected.object));
  const endCamPos = new THREE.Vector3().subVectors(distVec, viewPos);
  endCamPos.add(camera.position);

  const posTween = new TWEEN.Tween(camera.position)
    .to(endCamPos, isInFocus ? 500 : 1000)
    .easing(TWEEN.Easing.Quartic.Out);

  //Rotation animation setup
  const qm = new THREE.Quaternion();
  const curQuarternion = camera.quaternion.clone();
  let destRotation;
  if (isInFocus) { //use original camera rotation
    destRotation = camOriginalRotation;
  } else { //find quaternion of camera pointing at sprite
    const tempCam = camera.clone();
    tempCam.lookAt(tarPos);
    destRotation = tempCam.quaternion;
  }

  const time = {t:0}
  const rotTween = new TWEEN.Tween(time)
    .to({t:1}, isInFocus ? 500 : 1000)
    .onUpdate(() => {
      THREE.Quaternion.slerp(curQuarternion, destRotation, qm, time.t);
      qm.normalize();
      camera.setRotationFromQuaternion(qm);
    })
    .easing(TWEEN.Easing.Quartic.Out);

  //Fog animation setup
  const normalFar = {far: scene.fog.far};
  const fogTween = new TWEEN.Tween(normalFar)
    .to({far: isInFocus ? 50 : 10}, isInFocus ? 500 : 1000)
    .onUpdate(() => scene.fog.far = normalFar.far)
    .easing(TWEEN.Easing.Quartic.Out);

  //Tweening
  ongoingTween.forEach(tween => tween.stop());
  ongoingTween = [rotTween, posTween, fogTween];
  posTween.onStart(() => {
    rotTween.start();
    fogTween.start();
  }).start();
}

const calcViewScalar = (viewObject) => {
  const visHeight = () => {
    return isBoundedByHeight
      ? viewObject.scale.y/MAX_SPRITE_WINDOW_RATIO
      : viewObject.scale.x/MAX_SPRITE_WINDOW_RATIO/camera.aspect;
  }
  const isBoundedByHeight = viewObject.scale.y/window.innerHeight >= viewObject.scale.x/window.innerWidth;
  const vFOV = camera.fov * Math.PI/180;
  return visHeight() / (2*Math.tan(vFOV/2));
}

renderer.domElement.addEventListener('wheel', event => {
  if (isInFocus) {return;}
  controls.movementSpeed = 30;
  controls.moveState.forward = event.wheelDelta > 0 ? 1 : 0;
  controls.moveState.back = event.wheelDelta < 0 ? 1 : 0;
  controls.updateMovementVector();

  clearTimeout(timer);
  timer = setTimeout(() => {
    controls.movementSpeed = 0;
    controls.moveState.forward = 0;
    controls.moveState.back = 0;
    controls.updateMovementVector();
  }, 200);
})

// Creating Regions
const calcCameraRegion = () => {
  const camPos = camera.position;
  const x = Math.floor(camPos.x/REGION_SIZE) * REGION_SIZE;
  const y = Math.floor(camPos.y/REGION_SIZE) * REGION_SIZE;
  const z = Math.floor(camPos.z/REGION_SIZE) * REGION_SIZE;
  return {x, y, z};
}
const camPos = calcCameraRegion();
for (let i = 0; i < 27; i++) {
  const spriteCount = 40;
  const regionCoords = {
    x : camPos.x + REGION_SIZE * (Math.floor(i / 9) - 1),
    y : camPos.y + REGION_SIZE * (Math.floor(i / 3) % 3 - 1),
    z : camPos.z + REGION_SIZE * (i % 3 - 1)
  };
  const regionPos = new THREE.Vector3(regionCoords.x ,regionCoords.y, regionCoords.z);
  const region = new Region(scene, regionPos, 50, 40);
  regions.push(region);
}

// Window adjustment cases
window.addEventListener('resize', event => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
renderer.domElement.addEventListener('mouseleave', () => {
  controls.rollSpeed = 0;
});
renderer.domElement.addEventListener('mouseenter', () => {
  if (!isInFocus){
    controls.rollSpeed = Math.PI / 6;
  }
});

// Animate and Render
function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  const delta = clock.getDelta();
  controls.update(delta);
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

animate();

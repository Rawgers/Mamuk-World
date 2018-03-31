const container = document.createElement( 'div' );
document.body.appendChild( container );

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181817);
scene.fog = new THREE.Fog(scene.background, 3, 50);

// Camera and camera controls
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 3, 1000);
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
controls.domElement = container;
controls.movementSpeed = 0;
controls.rollSpeed = Math.PI / 6;
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

renderer.domElement.addEventListener('click', event => {
  if (isInFocus){ //user desires to leave focus
    zoom(camOriginalPosition);
    controls.rollSpeed = Math.PI/6;
    intersected.object.material.fog = true;
    intersected.object.material.opacity = 0.5;
    isInFocus = false;
  }else if (intersected){ //user desires to focus on one sprite
    controls.rollSpeed = 0;
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
  // Position animation setup
  const distVec = new THREE.Vector3()
    .subVectors(tarPos, camera.position);
  const viewPos = isInFocus
    ? new THREE.Vector3()
    : distVec.clone().normalize().multiplyScalar(3);
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
  const normalDensity = {density: scene.fog.far};
  const fogTween = new TWEEN.Tween(normalDensity)
    .to({density: isInFocus ? 50 : 10}, isInFocus ? 500 : 1000)
    .onUpdate(() => scene.fog.density = normalDensity.density)
    .easing(TWEEN.Easing.Quartic.Out);

  //Tweening
  ongoingTween.forEach(tween => tween.stop());
  ongoingTween = [rotTween, posTween, fogTween];
  posTween.onStart(() => {
    rotTween.start();
    fogTween.start();
  }).start();
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

// Creating Sprites
const subwayImgNames = ['american', 'banana_peppers', 'black_forest_ham',
 'black_olives', 'chipotle_southwest', 'cucumbers', 'flatbread', 'green_peppers',
 'italian', 'italian_bmt', 'italian_herbs_and_cheese', 'jalapenos', 'lettuce',
 'mayonnaise', 'meatball_marinara', 'monterey_cheddar', 'multi_grain_flatbread',
 'mustard', 'nine_grain_wheat', 'oil', 'oven_roasted_chicken', 'pickles', 'ranch',
 'red_onions', 'spinach', 'sweet_onion', 'sweet_onion_chicken_teriyaki', 'tomatoes',
 'tuna', 'turkey_breast', 'vinaigrette', 'vinegar'];
const spriteMaps = subwayImgNames.map((item) => new THREE.TextureLoader()
  .load('./assets/subwaypics/' + item + '.png'));
for (let i = 0; i < 3000; i++) {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: spriteMaps[i % spriteMaps.length],
    fog: true
  });
  const testSprite = new THREE.Sprite(spriteMaterial);
  testSprite.position.set(Math.random()*100-50, Math.random()*100-50, Math.random()*100-50);
  scene.add(testSprite);
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
    }
    intersected = intersects[0];
    intersected && intersected.object.material.color.set(0xe57373);
  }
  TWEEN.update();
  renderer.render(scene, camera);
}

animate();

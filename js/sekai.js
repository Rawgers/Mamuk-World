const container = document.createElement( 'div' );
document.body.appendChild( container );

//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181817);
scene.fog = new THREE.FogExp2(scene.background, 0.02);

//Camera and camera controls
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 1000);
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
controls.domElement = container;
controls.movementSpeed = 30;
controls.rollSpeed = Math.PI / 6;

//Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

//Raycaster
const raycaster = new THREE.Raycaster();
let intersected; //to be used in render
const mouse = new THREE.Vector2();
let isInFocus = false;
let camOriginalPosition;
let camOriginalRotation;
window.addEventListener('mousemove', (event) => {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

renderer.domElement.addEventListener('click', (event) => {
  if (isInFocus === true){ //user desires to leave focus
    zoom(isInFocus, camOriginalPosition);
    controls.movementSpeed = 30;
    controls.rollSpeed = Math.PI / 6;
    isInFocus = false;
  }
  else if (intersected){ //user desires to focus on one sprite
    isInFocus = true;
    camOriginalPosition = camera.position;
    camOriginalRotation = camera.quaternion;
    controls.movementSpeed = 0;
    controls.rollSpeed = 0;
    zoom(isInFocus, intersected.object.position);
  }
});

const zoom = (isInFocus, tarPos) => {
  console.log(isInFocus, tarPos);
  // Position animation
  const interpolateCamera = (isInFocus, tarPos) => {
    const distVec = new THREE.Vector3()
      .subVectors(tarPos, camera.position);
    const viewPos = isInFocus
      ? new THREE.Vector3()
      : new THREE.Vector3().copy(distVec).normalize().multiplyScalar(0.01);
    const endPos = new THREE.Vector3().subVectors(distVec, viewPos);
    //Tweening
    const posTween = new TWEEN.Tween(camera.position).to(endPos, 1000)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
  }
  const rotateCamera = (isInFocus, tarPos) => {
    //Rotation animation
    const qm = new THREE.Quaternion();
    let destRotation;
    if (isInFocus) { //use original camera rotation
      destRotation = camOriginalRotation;
    } else { //find quaternion of camera pointing at sprite
      const tempCam = camera.clone();
      tempCam.lookAt(tarPos);
      destRotation = tempCam.quaternion;
    }
    //Tweening
    const time = {t:0}
    const rotTween = new TWEEN.Tween(time).to({t:1}, 1000)
      .onUpdate(() => {
        THREE.Quaternion.slerp(camera.quaternion, destRotation, qm, time.t);
        qm.normalize();
        camera.quaternion = qm;
      })
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
  }
  interpolateCamera(isInFocus, tarPos);
  rotateCamera(isInFocus, tarPos);
}

//Creating Sprites
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

//Window adjustment cases
window.addEventListener('resize', event => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
renderer.domElement.addEventListener('mouseleave', () => {
  controls.rollSpeed = 0;
});
renderer.domElement.addEventListener('mouseenter', () => {
  controls.rollSpeed = Math.PI / 6;
});

//Animate and Render
function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  const delta = clock.getDelta();
  controls.update(delta);

  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects( scene.children );
  if (intersected && intersected != intersects[0]) {
    intersected.object.material.color.set(0xffffff);
  }
  intersected = intersects[0];
  intersected && intersected.object.material.color.set( 0xe57373 );
  TWEEN.update();

  renderer.render(scene, camera);
}

animate();

const container = document.createElement( 'div' );
document.body.appendChild( container );

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181817);
scene.fog = new THREE.Fog(scene.background, 500, 3000)

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 3000);
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
controls.domElement = container;
controls.movementSpeed = 250;
// controls.domElement = container;
// controls.rollSpeed = Math.PI / 6;
// controls.autoForward = false;
// controls.dragToLook = false;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const spriteMap = new THREE.TextureLoader().load('./assets/img/pepper.jpg');
const spriteMaterial = new THREE.SpriteMaterial({map: spriteMap});
for (let i = 0; i < 1000; i++) {
  const testSprite = new THREE.Sprite( spriteMaterial );
  testSprite.position.set(Math.random()*100-50, Math.random()*100-50, Math.random()*100-50);
  scene.add(testSprite);
}

// let timer;
// renderer.domElement.addEventListener('mousemove', event => {
//   const xoffset = event.clientX - window.innerWidth/2
//   const yoffset = event.clientY - window.innerHeight/2
//   camera.rotation.x -= yoffset / 10000;
//   camera.rotation.y -= xoffset / 10000;
//
//   clearTimeout(timer);
//   timer = setTimeout(() => {
//     const rot_start = { x:camera.rotation.x, y:camera.rotation.y};
//     const rot_end = { x:camera.rotation.x - yoffset/1000, y:camera.rotation.y - xoffset/1000};
//     const rot_tween = new TWEEN.Tween(rot_start).to(rot_end, 500)
//       .easing(TWEEN.Easing.Quadratic.Out);
//     rot_tween.onUpdate(function(){
//       camera.rotation.x = rot_start.x;
//       camera.rotation.y = rot_start.y;
//     });
//     rot_tween.start();
//   }, 30);
// })

window.addEventListener('resize', event => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
  // TWEEN.update();
}

animate();

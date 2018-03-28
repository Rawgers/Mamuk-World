const container = document.createElement( 'div' );
document.body.appendChild( container );

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181817);
// scene.fog = new THREE.FogExp2(scene.background, 0.025, 3000);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 1000);
const clock = new THREE.Clock();
const controls = new THREE.FlyControls(camera);
controls.domElement = container;
controls.movementSpeed = 30;
controls.rollSpeed = Math.PI / 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

const spriteMap = new THREE.TextureLoader().load('./assets/img/pepper.jpg');
const spriteMaterial = new THREE.SpriteMaterial({map: spriteMap});
for (let i = 0; i < 3000; i++) {
  const testSprite = new THREE.Sprite( spriteMaterial );
  testSprite.position.set(Math.random()*100-50, Math.random()*100-50, Math.random()*100-50);
  scene.add(testSprite);
}

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
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects( scene.children );
  console.log(mouse);
  for (let i = 0; i < intersects.length; i++ ) {
		intersects[ i ].object.material.color.set( 0x9297C4 );
	}
  renderer.render(scene, camera);

}

animate();

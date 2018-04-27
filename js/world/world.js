/* global THREE */

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(SCENE_BACKGROUND);
//scene.background = new THREE.TextureLoader().load('img/universe_background.jpg');
//scene.fog = new THREE.Fog(0x666666/*scene.background*/, 3, DEFAULT_FOG_FAR);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// FirstPersonControls
const firstPersonControls = new THREE.FirstPersonControls(camera);
const clock = new THREE.Clock();
const toggleFirstPersonControls = activate => {
	firstPersonControls.movementSpeed = activate ? FLY_CONTROLS_MOVEMENT_SPEED : 0;
	firstPersonControls.lookSpeed = activate ? FLY_CONTROLS_ROLL_SPEED / 2 : 0;
};
toggleFirstPersonControls(true);

// Create the world background
const worldBackgroundTexture = new THREE.TextureLoader().load('test.png');
const worldBackground = new THREE.Mesh(
  new THREE.SphereGeometry(50, 32, 32),
  new THREE.MeshBasicMaterial({map: worldBackgroundTexture, side: THREE.BackSide})
);

console.log(worldBackground.position);
scene.add(worldBackground);

// Animate and Render
const animate = () => {
	requestAnimationFrame(animate);
	render();
};

const render = () => {
  firstPersonControls.update(clock.getDelta());
	renderer.render(scene, camera);
};

animate();
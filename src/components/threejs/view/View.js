import * as THREE from 'three';
import {DEFAULT_ROLL_SPEED, DEFAULT_MOVEMENT_SPEED,
  DEFAULT_FAR, DEFAULT_NEAR} from '../constants';

export default class View {
  constructor(renderer, scene, camera, cameraControlsClass) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.renderFunction; // Do not call renderer.render and cameraControls.update()

    this.clock = new THREE.Clock();
    this.cameraControlsClass = cameraControlsClass;
    this.cameraControls;

    this.raycaster = new THREE.Raycaster();
    this.raymouse = new THREE.Vector2();
    this.intersected;

    this.requestAnimationFrameId = null;
    this.eventListeners = [];

    this.start();
  }

  start() {
    View.currentView && View.currentView.stop();

    this.setCameraControls();
    this.setEventListeners(this.eventListeners);
    const animate = () => {
      this.requestAnimationFrameId = requestAnimationFrame(animate);
      this.cameraControls && this.cameraControls.update(this.clock.getDelta());
      this.renderFunction && this.renderFunction();
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    View.currentView = this;
  }

  stop() { // Don't need to be explicitly called when switching Views
    this.cameraControls && this.cameraControls.dispose();
    this.requestAnimationFrameId && cancelAnimationFrame(this.requestAnimationFrameId);
    this.requestAnimationFrameId = null;
    this.eventListeners.forEach(eventListener => {
      eventListener.target.removeEventListener(
        eventListener.type,
        eventListener.listener
      );
    });
    View.currentView = null;
  }

  setCameraControls() {
    if (this.cameraControlsClass) {
      this.cameraControls = new this.cameraControlsClass(this.camera);
      this.toggleCameraControls(true);
    }
  }

  toggleCameraControls(toBeActive) {
    if (this.cameraControls) {
      this.cameraControls.movementSpeed = toBeActive
        ? DEFAULT_MOVEMENT_SPEED : 0;
      this.cameraControls.rollSpeed = toBeActive
        ? DEFAULT_ROLL_SPEED : 0;
    }
  }

  toggleRaycaster(toBeActive) { // perhaps delete this method
    this.raycaster.near = toBeActive ? DEFAULT_NEAR : 0;
    this.raycaster.far = toBeActive ? DEFAULT_FAR : 0;
  }

  setRenderFunction(renderFunction) {
    this.renderFunction = renderFunction;
  }

  setEventListeners(eventListeners) {
    eventListeners.forEach(eventListener => {
      this.eventListeners.push(eventListener);
      eventListener.target.addEventListener(
        eventListener.type,
        eventListener.listener
      );
    });
  }
}

View.currentView = null;

import * as THREE from 'three';
import * as TWEEN from 'es6-tween';
import * as $ from 'jquery';

import View from './View';
import ZoomManager from '../zoom/ZoomManager';
import SphericalLoading from '../universe/SphericalLoading';
import {SCENE_BACKGROUND, DEFAULT_NEAR, DEFAULT_FAR} from '../constants';

export default class UniverseView extends View {
  constructor(renderer, scene, camera, cameraControlsClass) {
    super(renderer, scene, camera, cameraControlsClass);

    this.loadSphere;

    this.init();
    this.zoomManager = new ZoomManager(this.scene, this.camera, this.raycaster);

    this.setRenderFunction(this.render);
    this.wheelTimer;
    this.setEventListeners(this.defineListeners()); // listeners: [{type, listener}, ...]
  }

  init() {
    this.scene.background = new THREE.Color(SCENE_BACKGROUND);
    this.scene.fog = new THREE.Fog(this.scene.background, DEFAULT_NEAR, DEFAULT_FAR);
    this.raycaster.near =  DEFAULT_NEAR;
    this.raycaster.far = DEFAULT_FAR;

    //initialize far from camera to spawn on start
    const initialSphereCenter = new THREE.Vector3().addVectors(
      this.camera.position, new THREE.Vector3(1000, 1000, 1000)
    );
    this.loadSphere = new SphericalLoading(this.scene, initialSphereCenter);
  }

  render() {
    this.loadSphere.checkSpawn(this.camera.position);

    this.raycaster.setFromCamera(this.raymouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (this.intersected && this.intersected !== intersects[0]) {
      this.intersected.object.material.color.set(0xffffff);
    }
    $('html,body').css('cursor', intersects[0] ? 'pointer' : 'default');
    intersects[0] && intersects[0].object.material.color.set(0xe57373);
    this.intersected = intersects[0];

    TWEEN.update();
  }

  defineListeners() {
    // window resize
    const resizeListener = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // mouse leave/enter
    const mouseLeaveListener = () => {
      this.toggleCameraControls(false);
    };

    const mouseEnterListener = () => {
      this.zoomManager.isInFocus || this.toggleCameraControls(true);
    };

    // for raycaster's mouse position
    const raymouseListener = event => {
      this.raymouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.raymouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Scroll to move forward/backward
    const wheelListener = event => {
      if (this.zoomManager.isInFocus) {return;}
      this.cameraControls.moveState.forward = event.wheelDelta > 0 ? 1 : 0;
      this.cameraControls.moveState.back = event.wheelDelta < 0 ? 1 : 0;
      this.cameraControls.updateMovementVector();

      clearTimeout(this.wheelTimer);
      this.wheelTimer = setTimeout(() => {
        this.cameraControls.moveState.forward = 0;
        this.cameraControls.moveState.back = 0;
        this.cameraControls.updateMovementVector();
      }, 200);
    };

    // Zoom listener
    const spriteZoomListener = () => {
      if (this.zoomManager.isInFocus
        && this.intersected
        && this.intersected.object === this.zoomManager.focusedSprite) {
        // cannot zoom out when hovered over focusedSprite
        return;
      } else if (this.zoomManager.isInFocus){ // user desires to leave focus
        this.zoomManager.zoom();
      } else if (this.intersected){ // user desires to focus on one sprite
        this.zoomManager.rebindValues(
          this.camera.position.clone(),
          this.camera.quaternion.clone(),
          this.intersected.object
        );
        this.zoomManager.zoom();
      };
    };

    return [
      {target: window, type: 'resize', listener: resizeListener},
      {target: this.renderer.domElement, type: 'mouseleave', listener: mouseLeaveListener},
      {target: this.renderer.domElement, type: 'mouseenter', listener: mouseEnterListener},
      {target: this.renderer.domElement, type: 'mousemove', listener: raymouseListener},
      {target: this.renderer.domElement, type: 'wheel', listener: wheelListener},
      {target: this.renderer.domElement, type: 'mousedown', listener: spriteZoomListener}
    ];
  }
}

// const universeView = new UniverseView(
//   new THREE.Scene(),
//   new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, DEFAULT_NEAR, DEFAULT_FAR),
//   THREE.FlyControls
// );

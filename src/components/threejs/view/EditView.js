import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as $ from 'jquery';

import View from './View';
import UniverseView from './UniverseView';
import Constellation from '../zoom/Constellation';

import {EDIT_MAMUKA_SPRITE_RADIUS} from '../constants';

export default class EditView extends View {
  constructor(renderer, scene, camera, cameraControlsClass, mamuka) {
    super(renderer, scene, camera, cameraControlsClass);

    this.mamuka = mamuka;
    this.mamukaSprite = this.createMamukaSprite();
    this.currentProfile;
    this.currentConstellation;

    this.setRenderFunction(this.render);
    this.setEventListeners(this.defineListeners());

    this.init();

    // DOM
    this.editProfileButtonContainer = $('#edit-profile-button-container');
    this.speechBalloon = $('#edit-speech-balloon');

    // For user input
    this.currentSelectedStar;
  }

  init() {
    this.camera.position.z = 30;
  }

  start() {
    super.start();
    $('#edit-profile-button-container').css('visibility', 'visible'); // TODO
  }

  stop() {
    super.stop();
    // Remove all the DOM elements related to EditView
    this.editProfileButtonContainer.css('visibility', 'hidden');
    this.speechBalloon.css('visibility', 'hidden');
    // TODO: remove the input
  }

  render() {
    this.raycaster.setFromCamera(this.raymouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    //console.log(intersects[0]);

    // ChildStar's hover animation
    if (this.currentConstellation) {
      const currentIntersectStar = intersects[0]
        ? this.currentConstellation.getStarBySprite(intersects[0].object)
        : null;
      const previousIntersectStar = this.intersected
        ? this.currentConstellation.getStarBySprite(this.intersected.object)
        : null;
      if (currentIntersectStar && previousIntersectStar && currentIntersectStar !== previousIntersectStar) { // The hovered star is changed
        currentIntersectStar.hover();
        previousIntersectStar.unhover();
      } else if (currentIntersectStar && !previousIntersectStar) { // A star is hovered
        currentIntersectStar.hover();
        console.log(currentIntersectStar);
      } else if (!currentIntersectStar && previousIntersectStar) { // A star is unhovered
        previousIntersectStar.unhover();
      }
    }

    $('body').css('cursor', intersects[0] ? 'pointer' : 'default');
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
    /*const mouseLeaveListener = () => {
      this.toggleCameraControls(false);
    };

    const mouseEnterListener = () => {
      this.toggleCameraControls(true);
    };*/

    // for raycaster's mouse position
    const raymouseListener = event => {
      this.raymouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.raymouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Scroll to move forward/backward
    /*const wheelListener = event => {
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
    };*/

    const mouseDownListener = event => {
      if (this.currentConstellation) { // There is a constellation
        if (this.intersected) { // Something is clicked
          if (this.intersected.object === this.mamukaSprite) { // mamukaSprite is clicked
            this.closeConstellation(() => {
              this.editProfileButtonContainer.css('visibility', 'visible');
            });
          } else {
            const star = this.currentConstellation.getStarBySprite(this.intersected.object);
            if (star) { // A ChildStar is clicked
              star.click();
            }
          }
        } else { // Empty space is clicked
          this.currentSelectedStar = null;
        }
      } else { // There is no constellation
        if (this.intersected) { // Something is clicked
          if (this.intersected.object === this.mamukaSprite) { // mamukaSprite is clicked
            // Edit mamuka's name
          }
        } else { // Empty space is clicked
          UniverseView.start();
        }
      }
    }

    return [
      {target: window, type: 'resize', listener: resizeListener},
      //{target: this.renderer.domElement, type: 'wheel', listener: wheelListener},
      //{target: this.renderer.domElement, type: 'mouseleave', listener: mouseLeaveListener},
      //{target: this.renderer.domElement, type: 'mouseenter', listener: mouseEnterListener},
      {target: this.renderer.domElement, type: 'mousemove', listener: raymouseListener},
      {target: this.renderer.domElement, type: 'mousedown', listener: mouseDownListener}
    ];
  }

  createMamukaSprite() {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load(
        this.mamuka.image,
        texture => {
          const factor = EDIT_MAMUKA_SPRITE_RADIUS / new THREE.Vector2(texture.image.width / 2, texture.image.height / 2).length();
          console.log(factor);
          sprite.scale.set(texture.image.width * factor, texture.image.height * factor, 0);
        }
      )
    }));
    //sprite.scale.set(EDIT_MAMUKA_SPRITE_RADIUS * 2, EDIT_MAMUKA_SPRITE_RADIUS * 2, 0);
    this.scene.add(sprite);
    return sprite;
  }

  drawConstellation(type) {
    this.closeConstellation();
    this.currentConstellation = new Constellation(this.scene, this.mamuka, type);
  }

  closeConstellation(callback) {
    if (this.currentConstellation) {
      this.currentConstellation.close(callback);
    }
    this.currentConstellation = null;
  }

  mamukaTalk(text) {
    this.speechBalloon.text(text);
    this.speechBalloon.fadeIn();
  }

  mamukaStopTalking() {
    this.speechBalloon.fadeOut();
  }
}

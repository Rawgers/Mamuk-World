class ZoomManager {
  constructor(scene, camera, raycaster) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = raycaster;

    this.isInFocus = false;
    this.cameraOriginalPosition;
    this.cameraOriginalQuaternion;
    this.focusedSprite;

    this.ongoingTween = [];
  }

  rebindValues(cameraOriginalPosition, cameraOriginalQuaternion, focusedSprite) {
    this.cameraOriginalPosition = cameraOriginalPosition;
    this.cameraOriginalQuaternion = cameraOriginalQuaternion;
    this.focusedSprite = focusedSprite;
  }

  zoom() {
    // Position animation setup
    const distanceVector = new THREE.Vector3().subVectors(
      this.isInFocus ? this.cameraOriginalPosition : this.focusedSprite.position,
      this.camera.position
    );
    const lookPosition = this.isInFocus
      ? new THREE.Vector3()
      : distanceVector.clone().normalize()
        .multiplyScalar(this.calculateViewScalar(this.focusedSprite));
    const endCameraPosition = new THREE.Vector3().subVectors(distanceVector, lookPosition);
    endCameraPosition.add(this.camera.position);

    const positionTween = new TWEEN.Tween(this.camera.position)
      .to(endCameraPosition, this.isInFocus ? TWEEN_ZOOM_OUT : TWEEN_ZOOM_IN)
      .easing(TWEEN.Easing.Quartic.Out);

    // Rotation animation setup
    const intermediateQuaternion = new THREE.Quaternion();
    const currentQuarternion = this.camera.quaternion.clone();
    let endQuaternion;
    if (this.isInFocus) { //use original camera rotation
      endQuaternion = this.cameraOriginalQuaternion;
    } else { // find quaternion of camera pointing at sprite
      const tempCamera = this.camera.clone();
      tempCamera.lookAt(this.focusedSprite.position);
      endQuaternion = tempCamera.quaternion;
    }

    const time = {t: 0}
    const rotationTween = new TWEEN.Tween(time)
      .to({t: 1}, this.isInFocus ? TWEEN_ZOOM_OUT : TWEEN_ZOOM_IN)
      .onUpdate(() => {
        THREE.Quaternion.slerp(currentQuarternion, endQuaternion, intermediateQuaternion, time.t);
        intermediateQuaternion.normalize();
        this.camera.setRotationFromQuaternion(intermediateQuaternion);
      })
      .easing(TWEEN.Easing.Quartic.Out);

    // Fog animation setup
    const normalFog = {near: this.scene.fog.near, far: this.scene.fog.far,};
    const fogTween = new TWEEN.Tween(normalFog)
      .to(this.isInFocus
          ? {near: DEFAULT_NEAR, far: DEFAULT_FAR}
          : {near: FOCUS_FOG_NEAR, far: FOCUS_FOG_FAR},
        this.isInFocus ? TWEEN_ZOOM_OUT : TWEEN_ZOOM_IN)
      .onUpdate(() => {
        this.scene.fog.near = normalFog.near;
        this.scene.fog.far = normalFog.far;
      })
      .easing(TWEEN.Easing.Quartic.Out);

    // Camera animation setup
    const normalCamNear = {near: this.camera.near}
    // Tweening
    this.ongoingTween.forEach(tween => tween.stop());
    this.ongoingTween = [rotationTween, positionTween, fogTween];
    positionTween.onStart(() => {
      rotationTween.start();
      fogTween.start();
      this.toggleOnStart();

    }).start().onComplete(() => {
      this.toggleOnComplete();
    });
  }

  calculateViewScalar(viewObject) {
    const visibleHeight = () => {
      return isBoundedByHeight
        ? viewObject.scale.y/FOCUSED_SPRITE_WINDOW_RATIO
        : viewObject.scale.x/FOCUSED_SPRITE_WINDOW_RATIO / this.camera.aspect;
    }
    const isBoundedByHeight = viewObject.scale.y / window.innerHeight
      >= viewObject.scale.x / window.innerWidth;
    const vFOV = THREE.Math.degToRad(this.camera.fov);
    return visibleHeight() / (2 * Math.tan(vFOV / 2));
  }

  toggleOnStart() {
    if (this.isInFocus) {
      this.focusedSprite.material.fog = true;
      this.camera.near = DEFAULT_NEAR;
      hideZoomMenu();
    } else{
      View.currentView.toggleCameraControls(false); // prevent glitchy camera during tween
      this.focusedSprite.material.opacity = 1; // in case transparent because previously visited
      this.focusedSprite.material.fog = false;
      $('html, body').css('cursor', 'default');
      showZoomMenu();
    }
    this.camera.updateProjectionMatrix();
  }

  toggleOnComplete() {
    if (this.isInFocus) {
      this.focusedSprite.material.opacity = VISITED_SPRITE_OPACITY;
      View.currentView.toggleCameraControls(true);
      this.isInFocus = false;
    } else {
      this.camera.near = this.calculateViewScalar(this.focusedSprite) * 0.8; // scale to view zoomed object
      this.isInFocus = true;
      this.focusedSprite.material.color.set(0xffffff); // undo raycast
    }
  }
}

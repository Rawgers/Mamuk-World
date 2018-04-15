let intersected;
let focusedSprite;
let isInFocus = false;
let camOriginalQuaternion;
let camOriginalRotation;
let ongoingTween = [];

const zoom = (tarPos) => {
  // Position animation setup
  const distVec = new THREE.Vector3().subVectors(tarPos, camera.position);
  const viewPos = isInFocus
    ? new THREE.Vector3()
    : distVec.clone().normalize().multiplyScalar(calcViewScalar(focusedSprite));
  const endCamPos = new THREE.Vector3().subVectors(distVec, viewPos);
  endCamPos.add(camera.position);

  const posTween = new TWEEN.Tween(camera.position)
    .to(endCamPos, isInFocus ? TWEEN_ZOOM_OUT : TWEEN_ZOOM_IN)
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
    .to({t:1}, isInFocus ? TWEEN_ZOOM_OUT : TWEEN_ZOOM_IN)
    .onUpdate(() => {
      THREE.Quaternion.slerp(curQuarternion, destRotation, qm, time.t);
      qm.normalize();
      camera.setRotationFromQuaternion(qm);
    })
    .easing(TWEEN.Easing.Quartic.Out);

  //Fog animation setup
  const normalFog = {near: scene.fog.near, far: scene.fog.far,};
  const fogTween = new TWEEN.Tween(normalFog)
    .to(isInFocus
        ? {near: DEFAULT_NEAR, far: DEFAULT_FAR}
        : {near: FOCUS_FOG_NEAR, far: FOCUS_FOG_FAR},
      isInFocus ? TWEEN_ZOOM_OUT : TWEEN_ZOOM_IN)
    .onUpdate(() => {
      scene.fog.near = normalFog.near;
      scene.fog.far = normalFog.far;
    })
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
      ? viewObject.scale.y/FOCUSED_SPRITE_WINDOW_RATIO
      : viewObject.scale.x/FOCUSED_SPRITE_WINDOW_RATIO/camera.aspect;
  }
  const isBoundedByHeight = viewObject.scale.y/window.innerHeight >= viewObject.scale.x/window.innerWidth;
  const vFOV = camera.fov * Math.PI/180;
  return visHeight() / (2*Math.tan(vFOV/2));
}

const toggle = () => {
  if (isInFocus) {
    controls.rollSpeed = DEFAULT_ROLL_SPEED;
    controls.movementSpeed = DEFAULT_MOVEMENT_SPEED;
    focusedSprite.material.fog = true;
    focusedSprite.material.opacity = VISITED_SPRITE_OPACITY;
    camera.near = DEFAULT_NEAR;
    isInFocus = false;
  }else{
    controls.rollSpeed = 0;
    controls.movementSpeed = 0;
    // focusedSprite.material.color.set(0xffffff);
    focusedSprite.material.fog = false;
    focusedSprite.material.opacity = 1;
    camera.near = calcViewScalar(focusedSprite) * 0.8; //view zoomed object
    $('html,body').css('cursor', 'default');
    isInFocus = true;
  }
  camera.updateProjectionMatrix();
}

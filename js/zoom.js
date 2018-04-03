let intersected;
let isInFocus = false;
let camOriginalQuaternion;
let camOriginalRotation;
let ongoingTween = [];

const zoom = (tarPos) => {
  // Position animation setup
  const distVec = new THREE.Vector3().subVectors(tarPos, camera.position);
  const viewPos = isInFocus
    ? new THREE.Vector3()
    : distVec.clone().normalize().multiplyScalar(calcViewScalar(intersected.object));
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
  const normalFar = {far: scene.fog.far};
  const fogTween = new TWEEN.Tween(normalFar)
    .to({far: isInFocus ? 50 : 10}, isInFocus ? 500 : 1000)
    .onUpdate(() => scene.fog.far = normalFar.far)
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
    intersected.object.material.fog = true;
    intersected.object.material.opacity = 0.5;
    camera.near = 3;
    isInFocus = false;
  }else{
    controls.rollSpeed = 0;
    controls.movementSpeed = 0;
    intersected.object.material.color.set(0xffffff);
    intersected.object.material.fog = false;
    intersected.object.material.opacity = 1;
    camera.near = calcViewScalar(intersected.object) * 0.8; //view zoomed object
    isInFocus = true;
  }
  camera.updateProjectionMatrix();
}

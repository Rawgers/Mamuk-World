const toggleControls = (controls, isActive) => {
  controls.rollSpeed = isActive ? DEFAULT_ROLL_SPEED : 0;
  controls.movementSpeed = isActive ? DEFAULT_MOVEMENT_SPEED : 0;
}

const toggleRaycaster = (raycaster, toBeActive) => {
  raycaster.near = toBeActive ? DEFAULT_NEAR : 0;
  raycaster.far = toBeActive ? DEFAULT_FAR : 0;
}

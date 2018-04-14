// Window adjustment cases
const setListeners = () => {
  //Resize window
  window.addEventListener('resize', event => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  //for raycaster's mouse position
  window.addEventListener('mousemove', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, false);

  //Toggle controls when mouse leaves window
  renderer.domElement.addEventListener('mouseleave', () => {
    controls.rollSpeed = 0;
  });
  renderer.domElement.addEventListener('mouseenter', () => {
    if (!isInFocus){
      controls.rollSpeed = DEFAULT_ROLL_SPEED;
    }
  });

  //Scroll to zoom in
  renderer.domElement.addEventListener('wheel', event => {
    if (isInFocus) {return;}
    controls.moveState.forward = event.wheelDelta > 0 ? 1 : 0;
    controls.moveState.back = event.wheelDelta < 0 ? 1 : 0;
    controls.updateMovementVector();

    clearTimeout(timer);
    timer = setTimeout(() => {
      controls.moveState.forward = 0;
      controls.moveState.back = 0;
      controls.updateMovementVector();
    }, 200);
  })

  renderer.domElement.addEventListener('mousedown', event => {
    console.log(intersected);
    if (isInFocus && intersected) {
      return;
    }else if (isInFocus){ //user desires to leave focus
      zoom(camOriginalPosition);
      toggle();
    }else if (intersected){ //user desires to focus on one sprite
      focusedSprite = intersected.object;
      camOriginalPosition = camera.position.clone();
      camOriginalRotation = camera.quaternion.clone();
      zoom(focusedSprite.position);
      toggle();
    }
  });
}

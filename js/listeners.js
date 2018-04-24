const setListeners = () => {
  // Resize window
  window.addEventListener('resize', event => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // for raycaster's mouse position
  window.addEventListener('mousemove', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, false);

  //Toggle controls when mouse leaves window
  renderer.domElement.addEventListener('mouseleave', () => {
    toggleControls(controls, false);
  });
  renderer.domElement.addEventListener('mouseenter', () => {
    if (!isInFocus){
      toggleControls(controls, true);
    }
  });

  // Scroll to zoom in
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

  // Zoom listener
  renderer.domElement.addEventListener('mousedown', event => {
    if (isInFocus && intersected && intersected.object === focusedSprite) {
      return;
    }else if (isInFocus){ //user desires to leave focus
      zoom(camOriginalPosition);
    }else if (intersected){ //user desires to focus on one sprite
      focusedSprite = intersected.object;
      camOriginalPosition = camera.position.clone();
      camOriginalRotation = camera.quaternion.clone();
      zoom(focusedSprite.position);
    }
  });
}

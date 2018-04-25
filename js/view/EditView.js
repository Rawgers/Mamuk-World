class EditView extends View {
  constructor(scene, camera, cameraControlsClass, mamuka) {
    super(scene, camera, cameraControlsClass);
    this.mamuka = mamuka;
    this.constellation;

    this.setRenderFunction(this.render);
    this.setEventListeners(this.defineListeners());

    this.init();
  }

  init() {
    this.camera.position.z = 30;
  }

  drawConstellation(type) {
    this.closeConstellation();
    this.constellation = new Constellation(this.scene, this.mamuka, type);
  }

  closeConstellation() {
    if (this.constellation) {
      this.constellation.closeConstellation();
    }
  }

  render() {
    this.raycaster.setFromCamera(this.raymouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (this.intersected && this.intersected != intersects[0]) {
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
      View.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // mouse leave/enter
    const mouseLeaveListener = () => {
      this.toggleCameraControls(false);
    };

    const mouseEnterListener = () => {
      this.toggleCameraControls(true);
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

    return [
      {target: View.renderer.domElement, type: 'mousemove', listener: raymouseListener},
      {target: View.renderer.domElement, type: 'wheel', listener: wheelListener},
      {target: window, type: 'resize', listener: resizeListener},
      {target: View.renderer.domElement, type: 'mouseleave', listener: mouseLeaveListener},
      {target: View.renderer.domElement, type: 'mouseenter', listener: mouseEnterListener}
    ];
  }
}

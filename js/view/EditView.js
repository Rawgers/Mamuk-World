class EditView extends View {
  constructor(scene, camera, cameraControlsClass, mamuka) {
    super(scene, camera, cameraControlsClass);

    this.mamuka = mamuka;
    this.constellation;

    this.setRenderFunction(this.render);
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
}

class View {
  constructor(scene, camera, cameraControlsClass) {
    if (!View.renderer) {
      console.log('Set the renderer before creating any View object!');
    }
    this.scene = scene;
    this.camera = camera;
    this.renderFunction = () => {};

    this.cameraControls;
    this.cameraControlsClass = cameraControlsClass;
    this.clock = new THREE.Clock();

    this.raycaster = new THREE.Raycaster();
    this.raymouse = new THREE.Vector2();
    this.intersected;

    this.requestAnimationFrameId = null;
    this.eventListeners = [];

    this.start();
  }

  start() {
    View.currentView && View.currentView.stop();

    this.setCameraControls();
    this.setEventListeners(this.eventListeners);
    const animate = () => {
      this.requestAnimationFrameId = requestAnimationFrame(animate);
      this.cameraControls && this.cameraControls.update(this.clock.getDelta());
      this.renderFunction(); // Do not call renderer.render and cameraControls.update()
      View.renderer.render(this.scene, this.camera);
    };
    animate();

    View.currentView = this;
  }

  stop() { // Don't need to be explicitly called when switching Views
    this.cameraControls && this.cameraControls.dispose();
    this.requestAnimationFrameId && cancelAnimationFrame(this.requestAnimationFrameId);
    this.requestAnimationFrameId = null;
    this.eventListeners.forEach(eventListener => {
      View.renderer.domElement.removeEventListener(eventListener.type, eventListener.function);
    });
    View.currentView = null;
  }

  setCameraControls() {
    if (this.cameraControlsClass) {
      this.cameraControls = new this.cameraControlsClass(this.camera);
      this.toggleCameraControls(true);
    }
  }

  toggleCameraControls(toBeActive) {
    if (this.cameraControls) {
      this.cameraControls.movementSpeed = toBeActive
        ? DEFAULT_MOVEMENT_SPEED : 0;
      this.cameraControls.rollSpeed = toBeActive
        ? DEFAULT_ROLL_SPEED : 0;
    }
  }

  toggleRaycaster(toBeActive) { // perhaps delete this method
    this.raycaster.near = toBeActive ? DEFAULT_NEAR : 0;
    this.raycaster.far = toBeActive ? DEFAULT_FAR : 0;
  }

  setRenderFunction(renderFunction) {
    this.renderFunction = renderFunction;
  }

  setEventListeners(eventListeners) {
    // listeners: [{type: 'mousedown', listener: function}, ...]
    eventListeners.forEach(eventListener => {
      this.eventListeners.push(eventListener);
      eventListener.target.addEventListener(
        eventListener.type,
        event => eventListener.listener(event)
      );
    });
  }
}

View.currentView = null;
View.renderer = new THREE.WebGLRenderer({antialias: true});
View.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(View.renderer.domElement);

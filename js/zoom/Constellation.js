class Constellation { // Constellation represented by tree data structure
  constructor(allTexts, scene) {
    this.root = new Star(allTexts[0], null, scene, new THREE.Vector3());
    this.root.sprite.material.color.set(0x9cde9f);
    this.createConstellation(allTexts, scene);
  }
  createConstellation(allTexts, scene) {
    function createConstellationHelper(allTexts, starQueue, scene) {
      if (allTexts.length == 0) {
        return;
      } else {
        const currentStar = starQueue.dequeue();
        const branchCount = currentStar.isRoot() ? 3 : THREE.Math.randInt(1, 3);
        const remainingText = allTexts;
        for (let i = 0; allTexts.length > 0 && i < branchCount; i++) {
          const star = new Star(allTexts[0], currentStar, scene);
          starQueue.enqueue(star);
          remainingText.splice(0, 1);
          currentStar.addStar(star);
        }
        createConstellationHelper(remainingText, starQueue, scene);
      }
    }
    const starQueue = new Queue();
    starQueue.enqueue(this.root);
    createConstellationHelper(allTexts, starQueue, scene);
  }

  randomizeBranches() {

  }
}

class Star {
  constructor(value, parent, scene, defaultPosition=null) {
    this.scene = scene;
    this.value = value;
    this.parent = parent;
    this.childStars = [];
    this.sprite;
    this.line;
    this.addToScene(this.scene, defaultPosition ? defaultPosition : this.calculateRandomPosition());
  }
  calculateRandomPosition() {
    if (this.parent.isRoot() && this.parent.children) {
      const siblingPosition = this.parent.children[this.parent.children.length - 1].sprite.position
      const parentPosition = this.parent.sprite.position;
      return addVectors(siblingPosition, parentPosition);
    }
    const randTheta = THREE.Math.randFloat(0, Math.PI*2);
    const x = this.parent.sprite.position.x + Math.sin(randTheta) * STAR_DISTANCE;
    const y = this.parent.sprite.position.y + Math.cos(randTheta) * STAR_DISTANCE;
    return new THREE.Vector3(x, y, 0);
  }

  addStar(value) {
    if (value instanceof Star) { // for createConstellation
      this.childStars.push(value);
    } else if (typeof value === 'string') { // for user input
      this.childStars.push(new Star(value));
    }
  }

  removeStar(star) {

  }

  addToScene(scene, position) {
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({map: Star.texture, color: 0xffffff})
    );
    this.sprite.position.set(position.x, position.y, position.z);
    scene.add(this.sprite);

    if (this.parent) {
      const lineGeometry = new THREE.Geometry();
      const start = this.sprite.position.clone();
      const end = this.parent.sprite.position.clone();
      const correction = new THREE.Vector3().subVectors(end, start).clampLength(0.3, 0.3);
      const correctedStart = new THREE.Vector3().addVectors(start, correction);
      const correctedEnd = new THREE.Vector3().subVectors(end, correction);
      lineGeometry.vertices.push(
        correctedStart,
        correctedEnd
      );
      this.line = new THREE.Line(lineGeometry, Star.lineMaterial);
      scene.add(this.line);
    }
  }

  isRoot() {
    return this.parent == null;
  }
}
Star.texture = new THREE.TextureLoader().load('./assets/star.png');
Star.lineMaterial = new THREE.LineBasicMaterial({color: 0x5DB7DE});

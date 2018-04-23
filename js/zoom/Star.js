class Star {
  constructor(scene) {
    this.scene = scene;
    this.childStars = [];
  }

  addStar(childStar) {
    if (childStar instanceof ChildStar) { // for createConstellation
      this.childStars.push(childStar);
    } else if (typeof text === 'string') { // for user input
      this.childStars.push(new ChildStar(childStar));
    }
  }

  removeStar(star) {

  }

  showStar() {
    if(this.isLeaf()) {return;}
    this.childStars.forEach(star => star.tweenLines());
  }

  tweenLines() {
    const lineTween = new TWEEN.Tween(this.line.geometry.vertices[1])
      .to(this.lineEnd, 300)
      .onUpdate(() => {this.line.geometry.verticesNeedUpdate = true;})
      .onComplete(() => {
        this.sprite.visible = true;
        this.showStar();
      })
      .start();
  }

  isLeaf() {
    return this.childStars == true;
  }
}

class RootStar extends Star {
  constructor(scene, mamuka) {
    super(scene);
    this.position = new THREE.Vector3();
    this.mamuka = mamuka;
    this.radius;
    this.sprite;
    this.addToScene();
  }

  addToScene() {
    const texture = new THREE.TextureLoader().load(this.mamuka.image);
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: texture}));
    this.sprite.scale.set(8, 8, 0);
    this.radius = this.sprite.scale.x / 2 * Math.sqrt(2);
    scene.add(this.sprite);
  }
}

class ChildStar extends Star {
  constructor(text, scene, position, allStars) {
    super(scene);
    this.text = text;
    this.parent = parent;
    this.position = position;
    this.sprite;
    this.line;
    this.lineEnd; // used in Tweening
    this.addToScene(allStars);
  }

  addToScene(allStars) {
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({map: ChildStar.texture, color: 0xffffff})
    );
    this.sprite.position.set(this.position.x, this.position.y, this.position.z);
    this.sprite.visible = false;
    this.scene.add(this.sprite);
    if (allStars.length < 4) {
      this.parent = allStars[0];
    } else {
      this.parent = allStars.reduce((star1, star2) => {
        const star1Distance = star1.position.distanceTo(this.position);
        const star2Distance = star2.position.distanceTo(this.position);
        return star1Distance < star2Distance ? star1 : star2;
      });
    }
    this.parent.addStar(this);
    this.calculateConstellationLines();
  }

  calculateConstellationLines() {
    const lineGeometry = new THREE.Geometry();
    const start = this.parent.sprite.position.clone();
    const end = this.sprite.position.clone();
    const distanceVector = new THREE.Vector3().subVectors(end, start);
    const startCorrection = distanceVector.clone().normalize().multiplyScalar(
      this.parent instanceof RootStar ? this.parent.radius : 0.3
    );
    const endCorrection = distanceVector.clone().normalize().multiplyScalar(0.3);
    const correction = new THREE.Vector3()
      .subVectors(end, start).clampLength();
    const correctedStart = new THREE.Vector3().addVectors(start, startCorrection);
    const correctedEnd = new THREE.Vector3().subVectors(end, endCorrection);
    this.lineEnd = correctedEnd;
    lineGeometry.vertices.push(correctedStart.clone(), correctedStart.clone());
    // Tween lineGeometry.vertices[1] to this.lineEnd later
    this.line = new THREE.Line(lineGeometry, ChildStar.lineMaterial);
    scene.add(this.line);
  }
}

ChildStar.texture = new THREE.TextureLoader().load('./assets/star.png');
ChildStar.lineMaterial = new THREE.LineBasicMaterial({color: 0x5DB7DE});

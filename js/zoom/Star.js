class Star {
  constructor(scene) {
    this.scene = scene;
    this.childrenStars = [];
  }

  addStar(childStar) {
    this.childrenStars.push(childStar);
  }

  removeStar() {
    // remove connection to parent
    for (let i = 0; i < star.parent.childrenStars.length(); i++) {
      if (child === star) {
        star.parent.childrenStars.splice(i, 1);
      }
    }
    this.parent = null;

    // remove connection to children
    for (let child of childrenStars) {
      child.parent = undefined;
    }
    this.childrenStars = null;

    this.removeFromScene();
  }

  isLeaf() {
    return this.childrenStars == true;
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

  showStar() {
    this.childrenStars.forEach(childStar => childStar.tweenLines());
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
    this.bindParent(allStars);
    this.calculateConstellationLines();
  }

  addToScene(allStars) {
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({map: ChildStar.texture, color: 0xffffff})
    );
    this.sprite.position.set(this.position.x, this.position.y, this.position.z);
    this.sprite.visible = false;
    this.scene.add(this.sprite);
  }

  removeFromScene() {
    this.scene.remove(this.sprite);
    this.scene.remove(this.line);
  }

  bindParent(allStars) {
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

  tweenLines() {
    const lineTween = new TWEEN.Tween(this.line.geometry.vertices[1])
      .to(this.lineEnd, 300)
      .onUpdate(() => {this.line.geometry.verticesNeedUpdate = true;})
      .onComplete(() => {
        this.sprite.visible = true;
        this.childrenStars.forEach(childStar => childStar.tweenLines());
      })
      .start();
  }
}

ChildStar.texture = new THREE.TextureLoader().load('./assets/star.png');
ChildStar.lineMaterial = new THREE.LineBasicMaterial({color: 0x5DB7DE});

class Star {
  constructor(scene, color) {
    this.color = color;
    this.scene = scene;
    this.childrenStars = [];
  }

  addStar(childStar) {
    this.childrenStars.push(childStar);
  }

  removeStar() {
    // remove connection to parent
    for (let i = 0; i < this.parent.childrenStars.length(); i++) {
      if (this.parent.childrenStars[i] === star) {
        this.parent.childrenStars.splice(i, 1);
      }
    }
    this.parent = null;

    // remove connection to children
    for (let child of this.childrenStars) {
      child.parent = undefined;
    }
    this.childrenStars = null;

    this.removeFromScene();
  }
}

class ChildStar extends Star {
  constructor(scene, text, position, color, rootStar, allStars) {
    super(scene, color);
    this.text = text;
    this.parent = parent;
    this.rootStar = rootStar;
    this.position = position;
    this.sprite;

    this.line;
    this.lineEnd; // used in Tweening
    this.currentBobTweens = [];

    this.addToScene(allStars);
    this.bindParent(allStars);
    this.calculateConstellationLines();
  }

  addToScene(allStars) {
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({map: ChildStar.texture, color: this.color})
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
    this.line = new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({color: this.color})
    );
    this.scene.add(this.line);
  }

  tweenLinesShow() {
    const lineTween = new TWEEN.Tween(this.line.geometry.vertices[1])
      .to(this.lineEnd, 300)
      .onUpdate(() => {
        this.line.geometry.verticesNeedUpdate = true;
      })
      .onComplete(() => {
        this.sprite.visible = true;
        this.childrenStars.forEach(childStar => childStar.tweenLinesShow());
      })
      .start();
  }

  tweenLinesHide() {

  }

  startBob() {
    this.stopBob();
    const bobUpTween = new TWEEN.Tween(this.sprite.position)
      .to(this.position.clone().setY(this.position.y + 0.2), 300);
    const BobDownTween = new TWEEN.Tween(this.sprite.position)
      .to(this.position.clone().setY(this.position.y - 0.2), 300);
    bobUpTween.chain(bobUpTween);
    BobDownTween.chain(BobDownTween);
    bobUpTween.start();
    this.currentBobTweens.push(bobUpTween, BobDownTween);
  }
  stopBob() {
    this.currentBobTweens.forEach(bobTween => bobTween.stop())
    this.sprite.position.set(this.position.x, this.position.y, this.position.z);
    this.currentBobTweens = [];
  }
}

ChildStar.texture = new THREE.TextureLoader().load('./assets/star.png');

class RootStar extends Star {
  constructor(scene, mamuka) {
    super(scene, null);
    this.position = new THREE.Vector3();
    this.mamuka = mamuka;
    this.radius;
    this.sprite;
    this.addToScene();
  }

  addToScene() {
    const texture = new THREE.TextureLoader().load(this.mamuka.image);
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: texture}));
    this.sprite.scale.set(ROOT_STAR_DIM, ROOT_STAR_DIM, 0);
    this.radius = this.sprite.scale.x / 2 * Math.sqrt(2);
    console.log(this.sprite);
    this.scene.add(this.sprite);
  }

  showStar() {
    this.childrenStars.forEach(childStar => childStar.tweenLinesShow());
  }

  hideStar() {
    this.childrenStars.forEach(childStar => childStar.tweenLinesHide());
  }
}

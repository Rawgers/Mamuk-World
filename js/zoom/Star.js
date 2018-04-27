/* global THREE */
/* global TWEEN */

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
    for (let i = 0; i < this.parent.childrenStars.length(); i++) {
      if (this.parent.childrenStars[i] === this) {
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

  isLeaf() {
    return this.childrenStars.length === 0;
  }
}

class RootStar extends Star {
  constructor(scene) {
    super(scene);
    this.position = new THREE.Vector3();
  }
  
  show() {
		this.childrenStars.forEach(childStar => childStar.show());
	}
	
	hide(callback) {
		callback && callback();
	}
}

class ChildStar extends Star {
  constructor(scene, text, position, color, rootStar, allStars) {
    super(scene);
    this.text = text;
    this.parent = parent;
    this.rootStar = rootStar;
    this.position = position;
    this.sprite;
    this.color = color;

    this.line;
    this.lineEnd; // used in Tweening
    this.currentBobTweens = [];
    this.currentScaleTween;

    this.addToScene(allStars);
    this.bindParent(allStars);
    this.calculateConstellationLines();
  }

  addToScene(allStars) {
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({map: ChildStar.texture, color: this.color})
    );
    this.sprite.position.set(this.position.x, this.position.y, this.position.z);
    this.sprite.material.opacity = 0;
    this.sprite.transparent = true;
    this.scene.add(this.sprite);
  }

  removeFromScene() {
    this.scene.remove(this.sprite);
    console.log(this.scene.children.length);
    this.scene.remove(this.line);
    console.log(this.scene.children.length);
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
    const start = this.parent.position.clone();
    const end = this.sprite.position.clone();
    const distanceVector = new THREE.Vector3().subVectors(end, start);
    const startCorrection = distanceVector.clone().normalize().multiplyScalar(
      this.parent instanceof RootStar ? MAMUKA_SPRITE_RADIUS : 0.3
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
  
  show() {
		this.tweenVisibility(true, () => {
			this.childrenStars.forEach(childStar => childStar.show());
		});
	}
	
	hide(callback) {
		this.tweenVisibility(false, () => {
		  // Remove itself from the parent's children list
			for (let i = 0; i < this.parent.childrenStars.length; i++) {
			  if (this.parent.childrenStars[i] === this) {
			    this.parent.childrenStars.splice(i, 1);
			  }
			}
			if (this.parent.isLeaf()) {
				this.parent.hide(callback);
			}
			this.removeFromScene();
		});
	}

  tweenVisibility(isShowing, callback) {
    const lineTween = new TWEEN.Tween(this.line.geometry.vertices[1])
			.to(isShowing ? this.lineEnd : this.line.geometry.vertices[0], isShowing ? 300 : 150)
			.onUpdate(() => {
				this.line.geometry.verticesNeedUpdate = true;
			});
		const intermediateOpacity = {opacity: this.sprite.material.opacity};
		const opacityTween = new TWEEN.Tween(intermediateOpacity)
			.to({opacity: isShowing ? 1 : 0}, isShowing ? 100 : 50)
			.onUpdate(() => {
				this.sprite.material.opacity = intermediateOpacity.opacity;
			});
		
		const firstTween = isShowing ? lineTween : opacityTween;
		const secondTween = isShowing ? opacityTween : lineTween;
		firstTween.onComplete(() => {
		  secondTween.start();
		  callback();
		}).start();
  }
  
  hover() {
    console.log('hover');
    this.expand();
    this.startBob();
  }
  
  unhover() {
    console.log('unhover');
    this.shrink();
    this.stopBob();
  }
  
  expand() {
    // Cancel previous scaling
    this.currentScaleTween && this.currentScaleTween.stop();
    this.currentScaleTween = new TWEEN.Tween(this.sprite.scale)
      .to(new THREE.Vector3(3, 3, 1), 300)
      .start();
  }
  
  shrink() {
    // Cancel previous scaling
    this.currentScaleTween && this.currentScaleTween.stop();
    this.currentScaleTween = new TWEEN.Tween(this.sprite.scale)
      .to(new THREE.Vector3(1, 1, 1), 300)
      .start();
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
  
  hover() {
    
  }
  
  click() {
    
  }
}

ChildStar.texture = new THREE.TextureLoader().load('assets/star.png');
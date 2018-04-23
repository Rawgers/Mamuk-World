class Constellation { // Constellation represented by tree data structure
  constructor(allTexts, mamuka, scene) {
    this.scene = scene;
    this.root = new RootStar(this.scene, mamuka);
    this.allStars = [this.root];
    this.layerThickness = 5;
    this.createConstellation(allTexts, 0);
    this.drawConstellation();
  }

  createConstellation(allTexts, layerIndex) {
    if (allTexts.length == 0) {
      return;
    }
    const remainingText = allTexts;
    const starCount = 3 + layerIndex * 6;
    const layerInnerRadius = this.root.radius + (this.layerThickness * layerIndex);
    const layerSectionAngle = (Math.PI * 2) / starCount;
    for (let i = 0; allTexts.length > 0 && i < starCount; i++) {
      const starPosition = this.randomizeStarPosition(i, layerInnerRadius, layerSectionAngle);
      const star = new ChildStar(allTexts[0], this.scene, starPosition, this.allStars);
      star.addToScene(this.allStars);
      this.allStars.push(star);
      remainingText.splice(0, 1);
    }
    this.createConstellation(remainingText, ++layerIndex);
    // The 0th index is the layer whose stars connect to the mamuka.
  }

  drawConstellation() {
    this.root.showStar();
  }

  permuteTexts() {
    /* Fisher-Yates (Knuth) Shuffle:
    https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array*/
    let currentIndex = this.allTexts.length();
    let temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.allTexts[currentIndex];
      this.allTexts[currentIndex] = this.allTexts[randomIndex];
      this.allTexts[randomIndex] = temporaryValue;
    }
    return this.allTexts;
  }

  randomizeStarPosition(starIndex, layerInnerRadius, layerSectionAngle) {
    const randomTheta = THREE.Math.randFloat(
      layerSectionAngle * starIndex, layerSectionAngle * (starIndex + 1)
    );
    const randomRadius = THREE.Math.randFloat(
      layerInnerRadius, layerInnerRadius + this.layerThickness
    );
    const x = Math.sin(randomTheta) * randomRadius;
    const y = Math.cos(randomTheta) * randomRadius;
    const z = 0;
    return new THREE.Vector3(x, y, z);
  }

  addNewStar(text, position) {
    const newStar = new ChildStar(text, this.scene, position, this.allStars);
    this.allStars.push(newStar);
  }

  removeStar(byeStar) {
    const children = byeStar.childrenStars;
    children.forEach(childStar => {childStar.removeFromScene();});
    for (i = 0; i < this.allStars.length(); i++) {
      if (this.allStars[i] in children) {
        this.allStars.splice(i, 1);
      }
    }
    byeStar.removeStar();
    children.forEach(child => {
      child.bindParent();
      child.calculateConstellationLines();
    })
  }
}

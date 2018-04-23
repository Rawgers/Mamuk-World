class Constellation { // Constellation represented by tree data structure
  constructor(allTexts, mamuka, scene) {
    this.root = new RootStar(scene, mamuka);
    this.allStars = [this.root];
    this.layerThickness = 5;
    this.createConstellation(allTexts, scene, 0);
    this.drawConstellation();
  }

  createConstellation(allTexts, scene, layerIndex) {
    if (allTexts.length == 0) {
      return;
    }
    const remainingText = allTexts;
    const starCount = 3 + layerIndex * 6;
    const layerInnerRadius = this.root.radius + (this.layerThickness * layerIndex);
    const layerSectionAngle = (Math.PI * 2) / starCount;
    for (let i = 0; allTexts.length > 0 && i < starCount; i++) {
      const starPosition = this.randomizeStarPosition(i, layerInnerRadius, layerSectionAngle);
      const star = new ChildStar(allTexts[0], scene, starPosition, this.allStars);
      star.addToScene(this.allStars);
      this.allStars.push(star);
      remainingText.splice(0, 1);
    }
    this.createConstellation(remainingText, scene, ++layerIndex);
    // The 0th index is the layer whose stars connect to the mamuka.
  }

  drawConstellation() {
    this.root.showStar();
  }

  randomizeBranches() {

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
}

import * as THREE from 'three';
import * as TWEEN from 'es6-tween';
import {ChildStar, RootStar} from './Star';

import {CONSTELLATION_COLOR, EDIT_MAMUKA_SPRITE_RADIUS} from '../constants';

export default class Constellation { // Constellation represented by tree data structure
  constructor(scene, mamuka, type) {
    this.scene = scene;
    this.type = type;
    this.color = CONSTELLATION_COLOR[this.type]
    this.rootStar = new RootStar(this.scene, mamuka);
    this.allStars = [this.rootStar];
    this.layerThickness = 5;
    this.createConstellation(this.defineLength(30), 0);
    this.draw();
  }

  createConstellation(allTexts, layerIndex) {
    if (allTexts.length === 0) {
      return;
    }
    const remainingText = allTexts;
    const starCount = 3 + layerIndex * 6;
    const layerInnerRadius = EDIT_MAMUKA_SPRITE_RADIUS * 1.4 + (this.layerThickness * layerIndex);
    const layerSectionAngle = (Math.PI * 2) / starCount;
    for (let i = 0; allTexts.length > 0 && i < starCount; i++) {
      const starPosition = this.randomizeStarPosition(i, layerInnerRadius, layerSectionAngle);
      const star = new ChildStar(this.scene, allTexts[0], starPosition, this.color, this.rootStar, this.allStars);
      star.addToScene(this.allStars);
      this.allStars.push(star);
      remainingText.splice(0, 1);
    }
    this.createConstellation(remainingText, ++layerIndex);
    // The 0th index is the layer whose stars connect to the mamuka.
  }

  draw() {
		this.rootStar.show();
	}

	close(callback) {
		const starsToFade = this.allStars.filter(star => star instanceof ChildStar);
		const intermediateOpacity = {opacity: 1};
		const fadeOutTween = new TWEEN.Tween(intermediateOpacity)
		  .to({opacity: 0}, 300)
		  .onUpdate(() => {
		    starsToFade.forEach(star => {
		      star.sprite.material.opacity = intermediateOpacity.opacity;
		      star.line.material.opacity = intermediateOpacity.opacity;
		    });
		  })
		  .onComplete(() => {
		    starsToFade.forEach(star => star.removeFromScene());
		    callback();
		  })
		  .start();
	}

  defineLength(n) {
    const textList = [];
    for (let i = 0; i < n; i++) {
      textList.push('');
    }
    return textList;
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
    const newStar = new ChildStar(this.scene, text, position, this.color, this.rootStar, this.allStars);
    this.allStars.push(newStar);
  }

  removeStar(byeStar) {
    const children = byeStar.childrenStars;
    children.forEach(childStar => {childStar.removeFromScene();});
    for (let i = 0; i < this.allStars.length(); i++) {
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

  getStarBySprite(sprite) {
    for (const star of this.allStars) {
      if (star.sprite === sprite) {
        return star;
      }
    }
    return null;
  }
}

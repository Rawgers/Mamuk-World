class SphericalLoading{
  constructor(scene, spawnRadius, viewRadius, initialSphereCenter, spawnCount) {
    this.scene = scene;
    this.spawnRadius = spawnRadius;
    this.viewRadius = viewRadius;
    this.previousSphereCenter = initialSphereCenter;
    this.spawnCount = spawnCount;
  }

  checkSpawn(camPos) {
    if (camPos.distanceTo(this.previousSphereCenter) > this.viewRadius) { //if need to spawn
      this.createSprites(camPos);
      this.removeSprites(camPos);
      Object.assign(this.previousSphereCenter,camPos);
    }
  };

  createSprites(camPos) {
    for (let i = 0; i < this.spawnCount; i++) {
      const spawnPos = this.randomPositionInSphere(camPos, this.spawnRadius);
      if (spawnPos.distanceTo(this.previousSphereCenter) < this.spawnRadius
        || spawnPos.distanceTo(camPos) > this.spawnRadius) {
        continue;
      }
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        color: parseInt(Math.floor(Math.random() * (16 ** 6)).toString(16), 16),
        fog: true
      }));
      sprite.scale.set(SPRITE_FRAME_DIMENSION, SPRITE_FRAME_DIMENSION, 1);
      sprite.position.copy(spawnPos);
      this.scene.add(sprite);
    }
  }

  randomPositionInSphere (camPos) {
    return new THREE.Vector3(
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + camPos.x,
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + camPos.y,
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + camPos.z
    );
  }

  removeSprites (camPos) {
    this.scene.children.forEach((sprite) => {
      if (camPos.distanceTo(sprite.position) > this.spawnRadius) {
        this.scene.remove(sprite);
      }
    });
  }

  // const subwayImgNames = ['american', 'banana_peppers', 'black_forest_ham',
  //  'black_olives', 'chipotle_southwest', 'cucumbers', 'flatbread', 'green_peppers',
  //  'italian', 'italian_bmt', 'italian_herbs_and_cheese', 'jalapenos', 'lettuce',
  //  'mayonnaise', 'meatball_marinara', 'monterey_cheddar', 'multi_grain_flatbread',
  //  'mustard', 'nine_grain_wheat', 'oil', 'oven_roasted_chicken', 'pickles', 'ranch',
  //  'red_onions', 'spinach', 'sweet_onion', 'sweet_onion_chicken_teriyaki', 'tomatoes',
  //  'tuna', 'turkey_breast', 'vinaigrette', 'vinegar'];
  //const pepperNames = ['horizontal_pepper', 'square_pepper', 'vertical_pepper'];

}

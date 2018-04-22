class SphericalLoading {
  constructor(scene, spawnRadius, viewRadius, initialSphereCenter, spawnCount) {
    this.scene = scene;
    this.spawnRadius = spawnRadius;
    this.viewRadius = viewRadius;
    this.prevSphereCenter = initialSphereCenter;
    this.spawnCount = spawnCount;
    this.loader = new THREE.TextureLoader();
    this.mamukaGen = this.assetGen(data.mamuka);
    this.mumuGen = this.assetGen(data.mumu);
  }

  checkSpawn(camPos) {
    if (camPos.distanceTo(this.prevSphereCenter) > this.viewRadius) { //if need to spawn
      this.createSprites(camPos);
      this.removeSprites(camPos);
      Object.assign(this.prevSphereCenter, camPos);
    }
  };

  createSprites(camPos) {
    this.createSpritesByInterval(0, camPos, this.prevSphereCenter.clone());
  }

  createSpritesByInterval(curCount, camPos, prevSphereCenter) {
    for (let i=0; i < 5; i++) {
      const spawnPos = this.randomPositionInCube(camPos);
      if (spawnPos.distanceTo(prevSphereCenter) < this.spawnRadius
        || spawnPos.distanceTo(camPos) > this.spawnRadius) {
        continue;
      }
      const sprite = new THREE.Sprite();
      this.createSpriteMap(i, sprite);
      sprite.position.copy(spawnPos);
    }
    if (curCount < this.spawnCount) {
      setTimeout(() => this.createSpritesByInterval(curCount + 5, camPos, prevSphereCenter), 1);
    }
  }

  createSpriteMap(index, sprite) {
    const image = this.getNextImage();
    this.loader.load(
      image,
      (texture) => {
        const spriteMaterial = new THREE.SpriteMaterial({map: texture, fog: true});
        sprite.material = spriteMaterial;
        this.setSpriteScale(sprite, texture);
        this.scene.add(sprite);
      }
    );
  }

  setSpriteScale(sprite, texture) {
    if (texture.image.width >= texture.image.height) {
      sprite.scale.set(SPRITE_FRAME_DIMENSION, SPRITE_FRAME_DIMENSION * texture.image.height/texture.image.width);
    } else {
      sprite.scale.set(SPRITE_FRAME_DIMENSION * texture.image.width/texture.image.height, SPRITE_FRAME_DIMENSION);
    }
  }

  randomPositionInCube(camPos) {
    return new THREE.Vector3(
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + camPos.x,
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + camPos.y,
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + camPos.z
    );
  }

  removeSprites(camPos) {
    this.scene.children.forEach((sprite) => {
      if (camPos.distanceTo(sprite.position) > this.spawnRadius) {
        this.scene.remove(sprite);
      }
    });
  }

  * assetGen(data) {
    const imgs = data.map(asset => asset.image);
    let i = 0;
    while (true) {
      yield imgs[i++ % imgs.length];
    }
  }

  getNextImage() {
    return (Math.random() < ASSET_SPAWN_RATIO)
      ? this.mamukaGen.next().value
      : this.mumuGen.next().value;
  }
}

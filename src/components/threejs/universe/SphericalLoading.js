import * as THREE from 'three';
import {SPAWN_RADIUS, VIEW_RADIUS, SPRITE_SPAWN_PER_LOAD,
  SPRITE_FRAME_DIMENSION, ASSET_SPAWN_RATIO} from '../constants';
import data from '../data/data';

export default class SphericalLoading {
  constructor(scene, initialSphereCenter) {
    this.scene = scene;
    this.spawnRadius = SPAWN_RADIUS;
    this.viewRadius = VIEW_RADIUS;
    this.previousSphereCenter = initialSphereCenter;
    this.spawnCount = SPRITE_SPAWN_PER_LOAD;
    this.textureLoader = new THREE.TextureLoader();

    this.mamukaGenerator = this.assetGenerator(data.mamuka);
    this.mumuGenerator = this.assetGenerator(data.mumu);
  }

  checkSpawn(cameraPosition) {
    if (cameraPosition.distanceTo(this.previousSphereCenter) > this.viewRadius) { // If need to spawn
      this.createSprites(cameraPosition);
      this.removeSprites(cameraPosition);
      Object.assign(this.previousSphereCenter, cameraPosition);
    }
  }

  createSprites(cameraPosition) {
    this.createSpritesByInterval(0, cameraPosition, this.previousSphereCenter.clone());
  }

  createSpritesByInterval(currentCount, cameraPosition, previousSphereCenter) {
    for (let i = 0; i < 5; i++) {
      const spawnPosition = this.randomPositionInCube(cameraPosition);
      if (spawnPosition.distanceTo(previousSphereCenter) < this.spawnRadius
        || spawnPosition.distanceTo(cameraPosition) > this.spawnRadius) {
        continue;
      }
      const sprite = new THREE.Sprite();
      this.setSpriteMap(sprite);
      sprite.position.copy(spawnPosition);
    }
    if (currentCount < this.spawnCount) {
      setTimeout(() => this.createSpritesByInterval(currentCount + 5, cameraPosition, previousSphereCenter), 1);
    }
  }

  setSpriteMap(sprite) {
    const image = this.getNextImage();
    this.textureLoader.load(
      image,
      texture => {
        const spriteMaterial = new THREE.SpriteMaterial({map: texture, fog: true});
        sprite.material = spriteMaterial;
        this.setSpriteScale(sprite, texture);
        this.scene.add(sprite);
      }
    );
  }

  setSpriteScale(sprite, texture) {
    if (texture.image.width >= texture.image.height) {
      sprite.scale.set(SPRITE_FRAME_DIMENSION, SPRITE_FRAME_DIMENSION * texture.image.height / texture.image.width);
    } else {
      sprite.scale.set(SPRITE_FRAME_DIMENSION * texture.image.width / texture.image.height, SPRITE_FRAME_DIMENSION);
    }
  }

  randomPositionInCube(cameraPosition) {
    return new THREE.Vector3(
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + cameraPosition.x,
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + cameraPosition.y,
      THREE.Math.randFloatSpread(this.spawnRadius * 2) + cameraPosition.z
    );
  }

  removeSprites(cameraPosition) {
    this.scene.children.forEach(sprite => {
      if (cameraPosition.distanceTo(sprite.position) > this.spawnRadius) {
        this.scene.remove(sprite);
      }
    });
  }

  * assetGenerator(data) {
    const images = data.map(asset => asset.image);
    let i = 0;
    while (true) {
      yield images[i++ % images.length];
    }
  }

  getNextImage() {
    return (Math.random() < ASSET_SPAWN_RATIO)
      ? this.mamukaGenerator.next().value
      : this.mumuGenerator.next().value;
  }
}

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
      createSprites(this.scene, camPos, SPAWN_RADIUS, SPRITE_SPAWN_PER_LOAD);
      removeSprites(this.scene, camPos, SPAWN_RADIUS);
      Object.assign(this.previousSphereCenter,camPos);
    }
  };
}

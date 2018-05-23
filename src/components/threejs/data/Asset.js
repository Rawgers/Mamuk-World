class Asset {
  constructor(id, image) {
    this.id = id;
    this.image = image;
  }
}

class Mamuka extends Asset {
  constructor(id, image, name, like, dislike, wish) {
    super(id, image);
    this.name = name;
    this.like = like;
    this.dislike = dislike;
    this.wish = wish;
  }
}
Mamuka.spawns = {};

class Mumu extends Asset {
  constructor(id, image, name) {
    super(id, image);
    this.name = name;
  }
}
Mumu.spawns = {};

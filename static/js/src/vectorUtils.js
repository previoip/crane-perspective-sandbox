class Base3 {
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    this.x = x; 
    this.y = y; 
    this.z = z;
  }

  offset(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
}

class Base2 {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x; 
    this.y = y; 
  }

  offset(x, y) {
    this.x += x;
    this.y += y;
  }
}

// impl
class Vec3 extends Base3 {
  setPolar(radius, theta, gamma) {
    const [x,y,z] = this.#polarToCartesian(radius, theta, gamma)
    this.set(x,y,z)
  }

  offsetPolar(radius, theta, gamma) {
    const [x,y,z] = this.#polarToCartesian(radius, theta, gamma)
    this.offset(x,y,z)
  }

  get coords() {
    return [this.x, this.y, this.z]
  }

  get dist() {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
  }

  #polarToCartesian(radius, theta, gamma) {
    return [
    /*x*/ radius * Math.sin(theta) * Math.cos(gamma),
    /*y*/ radius * Math.cos(theta) * Math.cos(gamma),
    /*z*/ radius * Math.sin(gamma)
    ]
  }

}

// impl
class Vec2 extends Base2 {

  setPolar(radius, theta) {
    const [x, y] = this.#polarToCartesian(radius, theta)
    this.set(x, y)
  }

  offsetPolar(radius, theta) {
    const [x, y] = this.#polarToCartesian(radius, theta)
    this.offset(x, y)
  }

  get coords() {
    return [this.x, this.y]
  }

  get dist() {
    return Math.sqrt(this.x**2 + this.y**2)
  }

  #polarToCartesian(radius, theta) {
    return [
    /*x*/ radius * Math.sin(theta),
    /*y*/ radius * Math.cos(theta)
    ]
  }
}

// impl
class Eul3 extends Base3 {
  get angles() {
    return [this.x, this.y, this.z]
  }
}

// impl
class Eul2 extends Base2 {
  get angles() {
    return [this.x, this.y]
  }
}


export { Vec2, Vec3, Eul2, Eul3 }
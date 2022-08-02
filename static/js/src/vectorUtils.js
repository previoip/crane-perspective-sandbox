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
    return this
  }

  offset(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
    return this
  }

  setArr(a = [0, 0, 0]) {
    this.set(a[0], a[1], a[2]);
    return this
  }

  offsetArr(a = [0, 0, 0]) {
    this.offset(a[0], a[1], a[2]);
    return this
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
    return this
  }

  offset(x, y) {
    this.x += x;
    this.y += y;
    return this
  }

  setArr(a = [0, 0]) {
    this.set(a[0], a[1]);
    return this
  }

  offsetArr(a = [0, 0]) {
    this.offset(a[0], a[1]);
    return this
  }
}

// impl
class Vec3 extends Base3 {
  setPolar(radius, theta, phi) {
    const [x,y,z] = this.#polarToCartesian(radius, theta, phi)
    this.set(x,y,z)
    return this
  }

  offsetPolar(radius, theta, phi) {
    const [x,y,z] = this.#polarToCartesian(radius, theta, phi)
    this.offset(x,y,z)
    return this
  }

  get coords() {
    return [this.x, this.y, this.z]
  }

  get dist() {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
  }

  #polarToCartesian(radius, theta, phi) {
    return [
    /*x*/ radius * Math.cos(theta) * Math.cos(phi),
    /*y*/ radius * Math.sin(theta) * Math.cos(phi),
    /*z*/ radius * Math.sin(phi)
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

  norm() {
    ['x', 'y', 'z'].forEach( (e) =>{
        if(this[e] > Math.PI*2){
        this[e] = this[e]%Math.PI*2
      }
    })
  }
}

// impl
class Eul2 extends Base2 {
  get angles() {
    return [this.x, this.y]
  }

  norm() {
    ['x', 'y'].forEach( (e) =>{
        if(this[e] > Math.PI*2){
        this[e] = this[e]%Math.PI*2
      }
    })
  }
}


export { Vec2, Vec3, Eul2, Eul3 }
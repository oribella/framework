export class Point {
  constructor(private x: number, private y: number) {}
  distanceTo(p: Point) {
    var xdist = this.x - p.x,
      ydist = this.y - p.y,
      dist = Math.sqrt(xdist * xdist + ydist * ydist);

    return dist;
  }
  deltaAngleTo(p: Point) {
    var x = p.x - this.x,
      y = p.y - this.y,
      theta = Math.atan2(y, x),
      degrees = theta * 180 / Math.PI;
    return degrees;
  }
  clone() {
    return new Point(this.x, this.y);
  }
}
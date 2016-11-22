import {expect} from 'chai';
import {Point} from '../src/point';

describe('Point', () => {

  it('should get distance between two points', () => {
    var p1 = new Point(4, 0);
    var p2 = new Point(0, 3);
    expect(p1.distanceTo(p2)).to.equal(5);
  });

  it('should get delta angle between two points', () => {
    var p1 = new Point(0, 5);
    var p2 = new Point(0, 4);
    expect(p1.deltaAngleTo(p2)).to.equal(-90);
  });

  it('should clone a point', () => {
    var p1 = new Point(3, 3);
    var p2 = p1.clone();
    expect(p2).to.deep.equal(p1);
  });

});

import {expect} from 'chai';
import {RETURN_FLAG, isMouse, isValidMouseButton} from '../src/utils';

describe("Default listener", () => {

  it('should map return flag', () => {
    expect(RETURN_FLAG.map(true)).to.equal(RETURN_FLAG.REMOVE_OTHERS);
    expect(RETURN_FLAG.map(false)).to.equal(RETURN_FLAG.REMOVE);
    expect(RETURN_FLAG.map(true)).to.equal(RETURN_FLAG.REMOVE_OTHERS);
    expect(RETURN_FLAG.map(1)).to.equal(RETURN_FLAG.START_EMITTED);
    expect(RETURN_FLAG.map(2)).to.equal(RETURN_FLAG.REMOVE);
    expect(RETURN_FLAG.map(4)).to.equal(RETURN_FLAG.REMOVE_OTHERS);
    expect(RETURN_FLAG.map(-1)).to.equal(RETURN_FLAG.IDLE);
  });

  it('should detect mouse IE10', () => {
    const supports = { MSPointerEvent: true, PointerEvent: false };
    expect(isMouse(supports, { pointerType: 'foo', MSPOINTER_TYPE_MOUSE: 'foo' })).to.equal(true);
  });

  it('should detect mouse IE11', () => {
    const supports = { MSPointerEvent: false, PointerEvent: true };
    expect(isMouse(supports, { pointerType: 'mouse' })).to.equal(true);
  });

  it('should detect mouse', () => {
    const supports = { MSPointerEvent: false, PointerEvent: false };
    expect(isMouse(supports, { type: 'mouse' })).to.equal(true);
  });

  it('should validate mouse button', () => {
    let evt = { button: 1 };
    expect(isValidMouseButton(evt, [1])).to.equal(true);

    evt = { button: 2 };
    expect(isValidMouseButton(evt, [3])).to.equal(true);

    evt = { button: 4 };
    expect(isValidMouseButton(evt, [2])).to.equal(true);

    evt = { button: 1000 };
    expect(isValidMouseButton(evt, [0])).to.equal(true);

    let evt1 = { which: 1000 };
    expect(isValidMouseButton(evt1, [1000])).to.equal(true);

  });

});

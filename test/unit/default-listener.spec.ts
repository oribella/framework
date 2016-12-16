import {expect} from 'chai';
import * as sinon from 'sinon';
import {DefaultListener} from '../../src/default-listener';
import {GESTURE_STRATEGY_FLAG} from '../../src/utils';

describe('Default listener', () => {
  let instance: DefaultListener;
  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should use defaults', () => {
    instance = new DefaultListener();
    expect(instance.pointers).to.equal(1);
    expect(instance.which).to.equal(1);
    expect(instance.prio).to.equal(100);
    expect(instance.strategy).to.equal(GESTURE_STRATEGY_FLAG.KEEP);
    expect(instance.down()).to.equal(0);
    expect(instance.start()).to.equal(0);
    expect(instance.update()).to.equal(0);
    expect(instance.end()).to.equal(0);
    expect(instance.cancel()).to.equal(0);
  });

  it('should mixin partial', () => {
    const defaultOptions = {
      pointers: 1,
      which: 1,
      prio: 100,
      strategy: GESTURE_STRATEGY_FLAG.KEEP
    };
    const listener = {
      pointers: 10,
      which: 3,
      strategy: GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT,
      down: sandbox.stub().returns(1),
      start: sandbox.stub().returns(2),
      update: sandbox.stub().returns(3),
      end: sandbox.stub().returns(4),
      cancel: sandbox.stub().returns(5)
    };
    instance = new DefaultListener(defaultOptions, listener);
    expect(instance.pointers).to.equal(10);
    expect(instance.which).to.equal(3);
    expect(instance.prio).to.equal(100);
    expect(instance.strategy).to.equal(GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT);
    expect(instance.down()).to.equal(1);
    expect(instance.start()).to.equal(2);
    expect(instance.update()).to.equal(3);
    expect(instance.end()).to.equal(4);
    expect(instance.cancel()).to.equal(5);
  });

});

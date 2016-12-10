import {expect} from 'chai';
import {Registry} from '../src/registry';
import {DefaultGesture} from '../src/default-gesture';
import {GESTURE_STRATEGY_FLAG} from '../src/utils';

describe('Registry', () => {
  let instance: Registry;

  beforeEach(() => {
    instance = new Registry();
  });

  it('should not have any registered gestures', () => {
    expect(instance.getTypes()).to.have.length(0);
  });

  it('should get registered gestures', () => {
    instance.register('foo', DefaultGesture);
    instance.register('bar', DefaultGesture);
    instance.register('baz', DefaultGesture);
    expect(instance.getTypes()).to.deep.equal(['foo', 'bar', 'baz']);
  });

  it('should create gesture', () => {
    instance.register('foo', DefaultGesture);
    const gesture = instance.create({} as Element, 'foo', {});
    expect(gesture).to.be.an.instanceOf(DefaultGesture);
  });

  it('should throw if type is not registered when trying to create gesture', () => {
    expect(instance.create.bind(instance, 'foo', {}, {} as Element)).to.throw();
  });

  it('should create default options', () => {
    instance.register('foo', DefaultGesture);
    const subscriber = {};
    const gesture = instance.create({} as Element, 'foo', subscriber);
    expect(gesture.listener.pointers).to.equal(1);
    expect(gesture.listener.which).to.equal(1);
    expect(gesture.listener.prio).to.equal(100);
    expect(gesture.listener.strategy).to.equal(GESTURE_STRATEGY_FLAG.KEEP);
  });

  it('should create custom options', () => {
    instance.register('foo', DefaultGesture);
    const subscriber = { pointers: 100, which: 3, prio: 2, strategy: GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT };
    const gesture = instance.create({} as Element, 'foo', subscriber);
    expect(gesture.listener.pointers).to.equal(100);
    expect(gesture.listener.which).to.equal(3);
    expect(gesture.listener.prio).to.equal(2);
    expect(gesture.listener.strategy).to.equal(GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT);
  });

});

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
    const gesture = instance.create('foo', {}, {} as Element);
    expect(gesture).to.be.an.instanceOf(DefaultGesture);
  });

  it('should throw if type is not registered when trying to create gesture', () => {
    expect(instance.create.bind(instance, 'foo', {}, {} as Element)).to.throw();
  });

  it('should create default options', () => {
    instance.register('foo', DefaultGesture);
    const subscriber = { options: undefined };
    instance.create('foo', subscriber, {} as Element);
    expect(subscriber.options).to.deep.equal({
      pointers: 1,
      which: 1,
      prio: 100,
      strategy: GESTURE_STRATEGY_FLAG.KEEP
    });
  });

  it('should create custom options', () => {
    instance.register('foo', DefaultGesture);
    const subscriber = { options: { pointers: 2 } };
    instance.create('foo', subscriber, <Element>{});
    expect(subscriber.options).to.deep.equal({
      pointers: 2,
      which: 1,
      prio: 100,
      strategy: GESTURE_STRATEGY_FLAG.KEEP
    });
  });

});

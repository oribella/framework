import {expect} from 'chai';
import {Registry, DefaultGesture} from '../src/registry';
import {GESTURE_STRATEGY_FLAG} from '../src/utils';

describe('Registry', () => {
  let instance: Registry;

  beforeEach(() => {
    instance = new Registry();
  });

  it('should not have any registered gestures', () => {
    expect(instance.getTypes()).to.have.length(0);
  });

  it('should create gesture', () => {
    instance.register('test', DefaultGesture);
    const gesture = instance.create('test', {}, {} as Element);
    expect(gesture).to.be.an.instanceOf(DefaultGesture);
  });

  it('should throw if type is not registered when trying to create gesture', () => {
    expect(instance.create.bind(instance, 'test', {}, {} as Element)).to.throw;
  });

  it('should create default options', () => {
    instance.register('test', DefaultGesture);
    const subscriber = { options: undefined };
    instance.create('test', subscriber, {} as Element);
    expect(subscriber.options).to.deep.equal({
      pointers: 1,
      which: 1,
      prio: 100,
      strategy: GESTURE_STRATEGY_FLAG.KEEP
    });
  });

  it('should create custom options', () => {
    instance.register('test', DefaultGesture);
    const subscriber = { options: { pointers: 2 } };
    instance.create('test', subscriber, <Element>{});
    expect(subscriber.options).to.deep.equal({
      pointers: 2,
      which: 1,
      prio: 100,
      strategy: GESTURE_STRATEGY_FLAG.KEEP
    });
  });

});

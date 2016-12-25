import { expect } from 'chai';
import * as sinon from 'sinon';
import { Registry } from '../../src/registry';
import { Gesture } from '../../src/gesture';
import { GESTURE_STRATEGY_FLAG } from '../../src/utils';
import { Options } from '../../src/utils';
// import {Point} from '../../src/point';

describe('Registry', () => {
  let instance: Registry;
  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    instance = new Registry();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not have any registered gestures', () => {
    expect(instance.getTypes()).to.have.length(0);
  });

  it('should get registered gestures', () => {
    class Foo extends Gesture<Options> { }
    // tslint:disable-next-line:max-classes-per-file
    class Bar extends Gesture<Options> { }
    // tslint:disable-next-line:max-classes-per-file
    class Baz extends Gesture<Options> { }
    instance.register(Foo, Options);
    instance.register(Bar, Options);
    instance.register(Baz, Options);
    expect(instance.getTypes()).to.deep.equal([Foo, Bar, Baz]);
  });

  it('should create gesture', () => {
    instance.register(Gesture, Options);
    const gesture = instance.create(Gesture, {} as Element, {});
    expect(gesture).to.be.an.instanceOf(Gesture);
  });

  it('should create gesture from object literal', () => {
    // const evt = {} as Event;
    // const pointers = [{ page: new Point(1, 2), client: new Point(3, 4) }];
    // const g => { options: { pointers: 100 }, start: sandbox.spy() };
    // class Foo extends g(Object){}
    // instance.register(Foo);
    // const gesture = instance.create({} as Element, 'bar', {});
    // gesture.start(evt, pointers);
    // expect(gesture).to.be.an.instanceOf(DefaultGesture);
    // expect(gesture.listener.pointers).to.equal(100);
    // expect(gesture.start).to.have.been.calledWithExactly(evt, pointers);
  });

  it('should throw if type is not registered when trying to create gesture', () => {
    expect(instance.create.bind(instance, 'foo', {}, {} as Element)).to.throw();
  });

  it('should create default options', () => {
    instance.register(Gesture, Options);
    const listener = {};
    const gesture = instance.create(Gesture, {} as Element, listener);
    expect(gesture.listener.pointers).to.equal(1);
    expect(gesture.listener.which).to.equal(1);
    expect(gesture.listener.prio).to.equal(100);
    expect(gesture.listener.strategy).to.equal(GESTURE_STRATEGY_FLAG.KEEP);
  });

  it('should create custom options', () => {
    instance.register(Gesture, Options);
    const listener = { pointers: 100, which: 3, prio: 2, strategy: GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT };
    const gesture = instance.create(Gesture, {} as Element, listener);
    expect(gesture.listener.pointers).to.equal(100);
    expect(gesture.listener.which).to.equal(3);
    expect(gesture.listener.prio).to.equal(2);
    expect(gesture.listener.strategy).to.equal(GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT);
  });

});

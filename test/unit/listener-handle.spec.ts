import { expect } from 'chai';
import { ListenerHandle } from '../../src/listener-handle';
import { Listener } from '../../src/listener';
import { Gesture } from '../../src/gesture';
import { Options } from '../../src/utils';

describe('Listener handle', () => {

  it('should be a constructor', () => {
    expect(ListenerHandle).to.throw();
  });

  it('should set element, type, subscriber, active', () => {
    const element = {};
    const listener = {};
    // class Foo extends DefaultGesture {};
    const handle = new ListenerHandle(Gesture, element as Element, listener as Listener<& Options>);
    expect(handle.element).to.equal(element);
    expect(handle.Type).to.equal(Gesture);
    expect(handle.listener).to.equal(listener);
  });

});

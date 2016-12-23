import {expect} from 'chai';
import {ListenerHandle} from '../../src/listener-handle';
import {DefaultListener} from '../../src/default-listener';
import {DefaultGesture} from '../../src/default-gesture';

describe('Listener handle', () => {

  it('should be a constructor', () => {
    expect(ListenerHandle).to.throw();
  });

  it('should set element, type, subscriber, active', () => {
    const element = {};
    const subscriber = {};
    // class Foo extends DefaultGesture {};
    const handle = new ListenerHandle(DefaultGesture, element as Element, subscriber as DefaultListener);
    expect(handle.element).to.equal(element);
    expect(handle.Type).to.equal(DefaultGesture);
    expect(handle.listener).to.equal(subscriber);
  });

});

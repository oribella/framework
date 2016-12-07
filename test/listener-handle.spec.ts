import {expect} from 'chai';
import {ListenerHandle} from "../src/listener-handle";
import {DefaultListener} from '../src/default-listener';

describe("Listener handle", () => {

  it("should be a constructor", () => {
    expect(ListenerHandle).to.throw();
  });

  it("should set element, type, subscriber, active", () => {
    const element = {};
    const type = "foo";
    const subscriber = {};
    const handle = new ListenerHandle(element as Element, type, subscriber as DefaultListener);
    expect(handle.element).to.equal(element);
    expect(handle.type).to.equal(type);
    expect(handle.listener).to.equal(subscriber);
  });

});

import {expect} from 'chai';
import {Handle} from "../src/handle";
import {DefaultListener} from '../src/registry';

describe("Handle", () => {

  it("should be a constructor", () => {
    expect(Handle).to.throw();
  });

  it("should set element, type, subscriber, active", () => {
    const element = {};
    const type = "foo";
    const subscriber = {};
    const handle = new Handle(element as Element, type, subscriber as DefaultListener);
    expect(handle.element).to.equal(element);
    expect(handle.type).to.equal(type);
    expect(handle.subscriber).to.equal(subscriber);
  });

});

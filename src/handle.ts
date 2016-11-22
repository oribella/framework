import {DefaultSubscriber} from './registry';

export class Handle {
  element: Element;
  type: string;
  subscriber: DefaultSubscriber;
  active: boolean;

  constructor(element: Element, type: string, subscriber: DefaultSubscriber, active: boolean) {
    this.element = element;
    this.type = type;
    this.subscriber = subscriber;
    this.active = active;
  }
}

import {DefaultSubscriber} from './registry';

export class Handle {
  element: Element;
  type: string;
  subscriber: DefaultSubscriber;

  constructor(element: Element, type: string, subscriber: DefaultSubscriber) {
    this.element = element;
    this.type = type;
    this.subscriber = subscriber;
  }
}

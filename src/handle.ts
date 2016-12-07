import {DefaultListener} from './registry';

export class Handle {
  element: Element;
  type: string;
  subscriber: DefaultListener;

  constructor(element: Element, type: string, subscriber: DefaultListener) {
    this.element = element;
    this.type = type;
    this.subscriber = subscriber;
  }
}

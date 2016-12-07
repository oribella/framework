import {DefaultListener} from './default-listener';

export class ListenerHandle {
  element: Element;
  type: string;
  listener: DefaultListener;

  constructor(element: Element, type: string, listener: DefaultListener) {
    this.element = element;
    this.type = type;
    this.listener = listener;
  }
}

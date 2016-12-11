import {DefaultListener} from './default-listener';

export class ListenerHandle {
  element: Element;
  type: string;
  listener: Partial<DefaultListener>;

  constructor(element: Element, type: string, listener: Partial<DefaultListener>) {
    this.element = element;
    this.type = type;
    this.listener = listener;
  }
}

import {DefaultListener} from './default-listener';

export class ListenerHandle {
  public element: Element;
  public type: string;
  public listener: Partial<DefaultListener>;

  constructor(element: Element, type: string, listener: Partial<DefaultListener>) {
    this.element = element;
    this.type = type;
    this.listener = listener;
  }
}

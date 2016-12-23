import {DefaultGesture} from './default-gesture';
import {DefaultListener} from './default-listener';

export class ListenerHandle<T extends typeof DefaultGesture> {
  constructor(public Type: T, public element: Element, public listener: Partial<DefaultListener>) {}
}
